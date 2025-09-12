import {
  LoginInputDTO,
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../domain/dtos/auth";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import {
  EntityNotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../../errors";
import {
  PasswordHasherProtocol,
  RateLimiterProtocol,
  TokenHandlerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
} from "../../protocols";
import { SessionService } from "./session.service";

interface LoginServiceDependencies {
  userRepository: UserRepository;
  militaryRepository: MilitaryRepository;
  sessionService: SessionService;
  tokenHandler: TokenHandlerProtocol;
  userCredentialsInputDTOSanitizer: UserCredentialsInputDTOSanitizerProtocol;
  passwordHasher: PasswordHasherProtocol;
  rateLimiter: RateLimiterProtocol;
}

export class LoginService {
  constructor(private readonly dependencies: LoginServiceDependencies) {}

  public readonly authenticate = async (
    data: LoginInputDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginOutputDTO> => {
    const {
      userRepository,
      militaryRepository,
      sessionService,
      tokenHandler,
      userCredentialsInputDTOSanitizer,
      passwordHasher,
      rateLimiter,
    } = this.dependencies;

    // Rate limiting by IP
    const ipLimitKey = `login:ip:${ipAddress}`;
    const ipLimit = await rateLimiter.checkLimit(
      ipLimitKey,
      10,
      15 * 60 * 1000,
    ); // 10 attempts per 15 minutes

    if (!ipLimit.allowed) {
      throw new TooManyRequestsError(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(
          (ipLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    // Sanitize credentials
    const sanitizedCredentials =
      userCredentialsInputDTOSanitizer.sanitize(data);

    // Rate limiting by RG
    const rgLimitKey = `login:rg:${sanitizedCredentials.rg}`;
    const rgLimit = await rateLimiter.checkLimit(rgLimitKey, 5, 15 * 60 * 1000);

    if (!rgLimit.allowed) {
      throw new TooManyRequestsError(
        `Muitas tentativas para este usuário. Tente novamente em ${Math.ceil(
          (rgLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    try {
      // Find military by RG
      const military = await militaryRepository.findByRg(
        sanitizedCredentials.rg,
      );
      if (!military) {
        await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
        throw new UnauthorizedError("Credenciais inválidas");
      }

      // Find user by military ID with password
      const user = await userRepository.findByMilitaryIdWithPassword(
        military.id,
      );

      if (!user) {
        await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
        throw new UnauthorizedError("Credenciais inválidas");
      }

      // Verify password
      const passwordMatch = await passwordHasher.compare(
        sanitizedCredentials.password,
        user.password,
      );

      if (!passwordMatch) {
        await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
        throw new UnauthorizedError("Credenciais inválidas");
      }

      // **SINGLE SESSION CONTROL**: Deactivate any existing session for this user
      await sessionService.deactivateAllUserSessions(user.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const deviceInfo = data.deviceInfo || `${userAgent.substring(0, 100)}`;

      // Create session record first to get the sessionId
      const session = await sessionService.create({
        userId: user.id,
        token: "temp", // Temporary placeholder
        refreshToken: "temp", // Temporary placeholder
        deviceInfo,
        ipAddress,
        userAgent,
        isActive: true,
        expiresAt,
      });

      // Generate tokens using the real sessionId
      const accessToken = tokenHandler.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
        role: user.role,
        militaryId: user.militaryId,
      });

      const refreshToken = tokenHandler.generateRefreshToken({
        userId: user.id,
        sessionId: session.id,
      });

      // Update session with the real tokens
      await sessionService.updateToken(session.id, accessToken);
      await sessionService.updateRefreshToken(session.id, refreshToken);

      // Reset rate limiting on successful login
      await rateLimiter.reset(ipLimitKey);
      await rateLimiter.reset(rgLimitKey);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          militaryId: user.militaryId,
          role: user.role,
        },
        expiresIn: 15 * 60, // 15 minutes in seconds
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof TooManyRequestsError
      ) {
        throw error;
      }

      // Record failed attempt for any other error
      await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
      throw new UnauthorizedError("Erro no processo de autenticação");
    }
  };

  public readonly refreshToken = async (
    data: RefreshTokenInputDTO,
    ipAddress: string,
  ): Promise<LoginOutputDTO> => {
    const { sessionService, userRepository, tokenHandler } = this.dependencies;

    try {
      // Verify refresh token
      tokenHandler.verifyRefreshToken(data.refreshToken);

      // Find session
      const session = await sessionService.findByRefreshToken(
        data.refreshToken,
      );

      if (!session || !session.isActive) {
        throw new UnauthorizedError("Sessão inválida ou expirada");
      }

      // Verify session belongs to the same device/IP (optional security check)
      if (session.ipAddress !== ipAddress) {
        // Deactivate session for security
        await sessionService.deactivateSession(session.id);
        throw new UnauthorizedError("Sessão comprometida detectada");
      }

      // Get user info
      const user = await userRepository.findById(session.userId);

      if (!user) {
        await sessionService.deactivateSession(session.id);
        throw new EntityNotFoundError("Usuário");
      }

      // Generate new access token
      const newAccessToken = tokenHandler.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
        role: user.role,
        militaryId: user.military.id,
      });

      // Update session with new token and last access
      await sessionService.updateToken(session.id, newAccessToken);

      return {
        accessToken: newAccessToken,
        refreshToken: data.refreshToken, // Same refresh token
        user: {
          id: user.id,
          militaryId: user.military.id,
          role: user.role,
        },
        expiresIn: 15 * 60, // 15 minutes in seconds
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof EntityNotFoundError
      ) {
        throw error;
      }

      throw new UnauthorizedError("Erro ao renovar token");
    }
  };

  private readonly recordFailedAttempt = async (
    ipLimitKey: string,
    rgLimitKey: string,
    rateLimiter: RateLimiterProtocol,
  ): Promise<void> => {
    await rateLimiter.recordAttempt(ipLimitKey, 15 * 60 * 1000);
    await rateLimiter.recordAttempt(rgLimitKey, 15 * 60 * 1000);
  };
}
