import { Request } from "express";

import { LoginInputDTO, LoginOutputDTO } from "../../../domain/dtos/auth";
import { User } from "../../../domain/entities";
import {
  MilitaryRepository,
  SessionRepository,
  UserRepository,
} from "../../../domain/repositories";
import { authSecurityLogger } from "../../../infra/adapters/middlewares";
import { TooManyRequestsError, UnauthorizedError } from "../../errors";
import {
  PasswordHasherProtocol,
  RateLimiterProtocol,
  TokenHandlerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
} from "../../protocols";

interface LoginServiceDependencies {
  userRepository: UserRepository;
  militaryRepository: MilitaryRepository;
  sessionRepository: SessionRepository;
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
    request?: Request, // Para logging contextual
  ): Promise<LoginOutputDTO> => {
    const { userCredentialsInputDTOSanitizer } = this.dependencies;

    // Sanitize credentials
    const sanitizedCredentials =
      userCredentialsInputDTOSanitizer.sanitize(data);

    // Validate rate limits
    const { ipLimitKey, rgLimitKey } = await this.validateRateLimit(
      ipAddress,
      sanitizedCredentials.rg,
    );

    try {
      // Validate credentials and get user data
      const { user } = await this.validateCredentials(
        sanitizedCredentials,
        ipLimitKey,
        rgLimitKey,
      );

      // Create user session and generate tokens
      const { accessToken, refreshToken } = await this.createUserSession(
        user,
        ipAddress,
        userAgent,
        data.deviceInfo,
      );

      // Reset rate limits on successful login
      await this.resetRateLimit(ipLimitKey, rgLimitKey);

      // Log successful login
      authSecurityLogger.logLogin(true, user.id, request, {
        rg: sanitizedCredentials.rg,
        militaryId: user.militaryId,
        userAgent,
        deviceInfo: data.deviceInfo,
      });

      // Build and return response
      return this.buildLoginResponse(user, accessToken, refreshToken);
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof TooManyRequestsError
      ) {
        throw error;
      }

      // Record failed attempt for any other error
      const { rateLimiter } = this.dependencies;
      await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
      throw new UnauthorizedError("Erro no processo de autenticação");
    }
  };

  private readonly validateRateLimit = async (
    ipAddress: string,
    rg: number,
  ): Promise<{ ipLimitKey: string; rgLimitKey: string }> => {
    const { rateLimiter } = this.dependencies;

    const ipLimitKey = `login:ip:${ipAddress}`;
    const ipLimit = await rateLimiter.checkLimit(
      ipLimitKey,
      10,
      15 * 60 * 1000,
    );

    if (!ipLimit.allowed) {
      authSecurityLogger.logLoginBlocked(
        ipAddress,
        undefined,
        "Rate limit por IP excedido",
      );
      throw new TooManyRequestsError(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(
          (ipLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    const rgLimitKey = `login:rg:${rg}`;
    const rgLimit = await rateLimiter.checkLimit(rgLimitKey, 5, 15 * 60 * 1000);

    if (!rgLimit.allowed) {
      authSecurityLogger.logLoginBlocked(
        `RG:${rg}`,
        undefined,
        "Rate limit por usuário excedido",
      );
      throw new TooManyRequestsError(
        `Muitas tentativas para este usuário. Tente novamente em ${Math.ceil(
          (rgLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    return { ipLimitKey, rgLimitKey };
  };

  private readonly validateCredentials = async (
    sanitizedCredentials: { rg: number; password: string },
    ipLimitKey: string,
    rgLimitKey: string,
  ): Promise<{ user: User }> => {
    const { userRepository, militaryRepository, passwordHasher, rateLimiter } =
      this.dependencies;

    const military = await militaryRepository.findByRg(sanitizedCredentials.rg);
    if (!military) {
      await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
      authSecurityLogger.logLogin(
        false,
        `RG:${sanitizedCredentials.rg}`,
        undefined,
        {
          reason: "RG não encontrado",
          rg: sanitizedCredentials.rg,
        },
      );
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const user = await userRepository.findByMilitaryIdWithPassword(military.id);

    if (!user) {
      await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
      authSecurityLogger.logLogin(
        false,
        `RG:${sanitizedCredentials.rg}`,
        undefined,
        {
          reason: "Usuário não encontrado para o militar",
          rg: sanitizedCredentials.rg,
          militaryId: military.id,
        },
      );
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const passwordMatch = await passwordHasher.compare(
      sanitizedCredentials.password,
      user.password,
    );

    if (!passwordMatch) {
      await this.recordFailedAttempt(ipLimitKey, rgLimitKey, rateLimiter);
      authSecurityLogger.logLogin(false, user.id, undefined, {
        reason: "Senha incorreta",
        rg: sanitizedCredentials.rg,
        userId: user.id,
      });
      throw new UnauthorizedError("Credenciais inválidas");
    }

    return { user };
  };

  private readonly createUserSession = async (
    user: User,
    ipAddress: string,
    userAgent: string,
    deviceInfo?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const { sessionRepository, tokenHandler } = this.dependencies;

    await sessionRepository.deactivateAllUserSessions(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const finalDeviceInfo = deviceInfo || `${userAgent.substring(0, 100)}`;

    const session = await sessionRepository.create({
      userId: user.id,
      token: "temp",
      refreshToken: "temp",
      deviceInfo: finalDeviceInfo,
      ipAddress,
      userAgent,
      isActive: true,
      expiresAt,
    });

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

    await sessionRepository.updateToken(session.id, accessToken);
    await sessionRepository.updateRefreshToken(session.id, refreshToken);

    return { accessToken, refreshToken };
  };

  private readonly buildLoginResponse = (
    user: User,
    accessToken: string,
    refreshToken: string,
  ): LoginOutputDTO => {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        militaryId: user.militaryId,
        role: user.role,
      },
      expiresIn: 15 * 60,
    };
  };

  private readonly resetRateLimit = async (
    ipLimitKey: string,
    rgLimitKey: string,
  ): Promise<void> => {
    const { rateLimiter } = this.dependencies;
    await rateLimiter.reset(ipLimitKey);
    await rateLimiter.reset(rgLimitKey);
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
