import { LoginInputDTO, LoginOutputDTO } from "../../../domain/dtos/auth";
import { User } from "../../../domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { TooManyRequestsError, UnauthorizedError } from "../../errors";
import {
  PasswordHasherProtocol,
  SecurityLoggerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
} from "../../protocols";
import { RateLimitingService } from "./rate-limiting.service";
import { SessionManagementService } from "./session-management.service";

interface LoginServiceDependencies {
  userRepository: UserRepository;
  militaryRepository: MilitaryRepository;
  userCredentialsInputDTOSanitizer: UserCredentialsInputDTOSanitizerProtocol;
  passwordHasher: PasswordHasherProtocol;
  rateLimitingService: RateLimitingService;
  sessionManagementService: SessionManagementService;
  securityLogger: SecurityLoggerProtocol;
}

/**
 * Serviço de autenticação com proteção contra ataques de força bruta.
 *
 * Implementa rate limiting por IP e por usuário, logging de segurança
 * e gerenciamento de sessões com JWT.
 */
export class LoginService {
  constructor(private readonly dependencies: LoginServiceDependencies) {}

  /**
   * Autentica um usuário e retorna tokens de acesso.
   *
   * @param data - Credenciais do usuário (RG e senha)
   * @param ipAddress - IP da requisição (para rate limiting)
   * @param userAgent - User agent do cliente
   * @param request - Request Express (opcional, para logging contextual)
   * @returns Tokens de acesso e informações do usuário
   * @throws {TooManyRequestsError} Quando rate limit é excedido
   * @throws {UnauthorizedError} Quando credenciais são inválidas
   */
  public readonly authenticate = async (
    data: LoginInputDTO,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginOutputDTO> => {
    const { userCredentialsInputDTOSanitizer, rateLimitingService } =
      this.dependencies;

    // Sanitize credentials
    const sanitizedCredentials =
      userCredentialsInputDTOSanitizer.sanitize(data);

    // Validate rate limits
    const rateLimitKeys = await rateLimitingService.validateLoginAttempt(
      ipAddress,
      sanitizedCredentials.rg,
    );

    try {
      // Validate credentials and get user data
      const { user } = await this.validateCredentials(
        sanitizedCredentials,
        rateLimitKeys,
      );

      // Create user session and generate tokens
      const { accessToken, refreshToken, sessionId, expiresIn } =
        await this.dependencies.sessionManagementService.createSession(
          user,
          ipAddress,
          userAgent,
          data.deviceInfo,
        );

      // Reset rate limits on successful login
      await rateLimitingService.resetLimits(rateLimitKeys);

      // Log successful login
      this.dependencies.securityLogger.logLogin(true, user.id, sessionId, {
        rg: sanitizedCredentials.rg,
        militaryId: user.militaryId,
        userAgent,
        deviceInfo: data.deviceInfo,
      });

      // Build and return response
      return this.buildLoginResponse(
        user,
        accessToken,
        refreshToken,
        expiresIn,
      );
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof TooManyRequestsError
      ) {
        throw error;
      }

      // Record failed attempt for any other error
      await rateLimitingService.recordFailedAttempt(rateLimitKeys);
      throw new UnauthorizedError("Erro no processo de autenticação");
    }
  };

  private readonly validateCredentials = async (
    sanitizedCredentials: { rg: number; password: string },
    rateLimitKeys: { ipLimitKey: string; rgLimitKey: string },
  ): Promise<{ user: User }> => {
    const {
      userRepository,
      militaryRepository,
      passwordHasher,
      rateLimitingService,
    } = this.dependencies;

    const military = await militaryRepository.findByRg(sanitizedCredentials.rg);
    if (!military) {
      await rateLimitingService.recordFailedAttempt(rateLimitKeys);
      this.dependencies.securityLogger.logLogin(
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
      await rateLimitingService.recordFailedAttempt(rateLimitKeys);
      this.dependencies.securityLogger.logLogin(
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
      await rateLimitingService.recordFailedAttempt(rateLimitKeys);
      this.dependencies.securityLogger.logLogin(false, user.id, undefined, {
        reason: "Senha incorreta",
        rg: sanitizedCredentials.rg,
        userId: user.id,
      });
      throw new UnauthorizedError("Credenciais inválidas");
    }

    return { user };
  };

  private readonly buildLoginResponse = (
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): LoginOutputDTO => {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        militaryId: user.militaryId,
        role: user.role,
      },
      expiresIn,
    };
  };
}
