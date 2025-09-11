import {
  LoginInputDTO,
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../domain/dtos/auth";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { SessionRepository } from "../../../domain/repositories";
import {
  EntityNotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../../errors";
import {
  JWTProtocol,
  PasswordHasherProtocol,
  RateLimiterProtocol,
} from "../../protocols";
import { UserSanitizationService, UserValidationService } from "../user";

interface AuthServiceDependencies {
  userRepository: UserRepository;
  militaryRepository: MilitaryRepository;
  sessionRepository: SessionRepository;
  userValidation: UserValidationService;
  userSanitization: UserSanitizationService;
  passwordHasher: PasswordHasherProtocol;
  jwtService: JWTProtocol;
  rateLimiter: RateLimiterProtocol;
}

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  public readonly login = async (
    data: LoginInputDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginOutputDTO> => {
    const {
      userRepository,
      militaryRepository,
      sessionRepository,
      userSanitization,
      passwordHasher,
      jwtService,
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
    const sanitizedCredentials = userSanitization.sanitizeUserCredentials(data);

    // Rate limiting by RG
    const rgLimitKey = `login:rg:${sanitizedCredentials.rg}`;
    const rgLimit = await rateLimiter.checkLimit(rgLimitKey, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes per RG

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
        // Record failed attempt
        await rateLimiter.recordAttempt(ipLimitKey, 15 * 60 * 1000);
        await rateLimiter.recordAttempt(rgLimitKey, 15 * 60 * 1000);

        throw new UnauthorizedError("Credenciais inválidas");
      }

      // Find user by military ID with password
      const user = await userRepository.findByMilitaryIdWithPassword(
        military.id,
      );

      if (!user) {
        // Record failed attempt
        await rateLimiter.recordAttempt(ipLimitKey, 15 * 60 * 1000);
        await rateLimiter.recordAttempt(rgLimitKey, 15 * 60 * 1000);

        throw new UnauthorizedError("Credenciais inválidas");
      }

      // Verify password
      const passwordMatch = await passwordHasher.compare(
        sanitizedCredentials.password,
        user.password,
      );

      if (!passwordMatch) {
        // Record failed attempt
        await rateLimiter.recordAttempt(ipLimitKey, 15 * 60 * 1000);
        await rateLimiter.recordAttempt(rgLimitKey, 15 * 60 * 1000);

        throw new UnauthorizedError("Credenciais inválidas");
      }

      // **SINGLE SESSION CONTROL**: Deactivate any existing session for this user
      await sessionRepository.deactivateAllUserSessions(user.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const deviceInfo = data.deviceInfo || `${userAgent.substring(0, 100)}`;

      // Create session record first to get the sessionId
      const session = await sessionRepository.create({
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
      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
        role: user.role,
        militaryId: user.militaryId,
      });

      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        sessionId: session.id,
      });

      // Update session with the real tokens
      await sessionRepository.updateToken(session.id, accessToken);
      await sessionRepository.updateRefreshToken(session.id, refreshToken);

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
      await rateLimiter.recordAttempt(ipLimitKey, 15 * 60 * 1000);
      await rateLimiter.recordAttempt(rgLimitKey, 15 * 60 * 1000);

      throw new UnauthorizedError("Erro no processo de autenticação");
    }
  };

  public readonly refreshToken = async (
    data: RefreshTokenInputDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginOutputDTO> => {
    const { sessionRepository, userRepository, jwtService } = this.dependencies;

    try {
      // Verify refresh token
      jwtService.verifyRefreshToken(data.refreshToken);

      // Find session
      const session = await sessionRepository.findByRefreshToken(
        data.refreshToken,
      );

      if (!session || !session.isActive) {
        throw new UnauthorizedError("Sessão inválida ou expirada");
      }

      // Verify session belongs to the same device/IP (optional security check)
      if (session.ipAddress !== ipAddress) {
        // Deactivate session for security
        await sessionRepository.deactivateSession(session.id);
        throw new UnauthorizedError("Sessão comprometida detectada");
      }

      // Additional security check for user agent changes
      if (session.userAgent !== userAgent) {
        // Log suspicious activity but don't block (user agent can change legitimately)
        // This could be enhanced with more sophisticated device fingerprinting
      }

      // Get user info
      const user = await userRepository.findById(session.userId);

      if (!user) {
        await sessionRepository.deactivateSession(session.id);
        throw new EntityNotFoundError("Usuário");
      }

      // Generate new access token
      const newAccessToken = jwtService.generateAccessToken({
        userId: user.id,
        sessionId: session.id,
        role: user.role,
        militaryId: user.military.id,
      });

      // Update session with new token and last access
      await sessionRepository.updateToken(session.id, newAccessToken);

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

  public readonly logout = async (sessionId: string): Promise<void> => {
    const { sessionRepository } = this.dependencies;

    try {
      await sessionRepository.deactivateSession(sessionId);
    } catch {
      // Silent fail for logout - even if session doesn't exist, logout is successful
    }
  };

  public readonly logoutAllSessions = async (userId: string): Promise<void> => {
    const { sessionRepository } = this.dependencies;

    try {
      await sessionRepository.deactivateAllUserSessions(userId);
    } catch {
      // Silent fail for logout
    }
  };

  public readonly validateSession = async (
    sessionId: string,
  ): Promise<boolean> => {
    const { sessionRepository } = this.dependencies;

    try {
      const session = await sessionRepository.findBySessionId(sessionId);
      return session !== null && session.isActive;
    } catch {
      return false;
    }
  };
}
