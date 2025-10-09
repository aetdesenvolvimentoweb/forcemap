import { ACCESS_TOKEN_EXPIRY_SECONDS } from "../../../domain/constants";
import {
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../domain/dtos/auth";
import {
  SessionRepository,
  UserRepository,
} from "../../../domain/repositories";
import { EntityNotFoundError, UnauthorizedError } from "../../errors";
import { SecurityLoggerProtocol, TokenHandlerProtocol } from "../../protocols";

interface RefreshTokenServiceDependencies {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  tokenHandler: TokenHandlerProtocol;
  securityLogger: SecurityLoggerProtocol;
}

export class RefreshTokenService {
  constructor(private readonly dependencies: RefreshTokenServiceDependencies) {}

  public readonly refreshToken = async (
    data: RefreshTokenInputDTO,
    ipAddress: string,
  ): Promise<LoginOutputDTO> => {
    const { sessionRepository, userRepository, tokenHandler, securityLogger } =
      this.dependencies;

    try {
      // Verify refresh token
      tokenHandler.verifyRefreshToken(data.refreshToken);

      // Find session
      const session = await sessionRepository.findByRefreshToken(
        data.refreshToken,
      );

      if (!session || !session.isActive) {
        throw new UnauthorizedError("Sessão inválida ou expirada");
      }

      // Verify session belongs to the same device/IP (optional security check)
      if (session.ipAddress !== ipAddress) {
        // Log security incident
        securityLogger.logLogin(false, session.userId, session.id, {
          reason: "IP address mismatch",
          originalIp: session.ipAddress,
          requestIp: ipAddress,
          sessionId: session.id,
        });

        // Deactivate session for security
        await sessionRepository.deactivateSession(session.id);
        throw new UnauthorizedError("Sessão comprometida detectada");
      }

      // Get user info
      const user = await userRepository.findById(session.userId);

      if (!user) {
        await sessionRepository.deactivateSession(session.id);
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
      await sessionRepository.updateToken(session.id, newAccessToken);

      // Log successful token refresh
      securityLogger.logTokenRefresh(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: data.refreshToken, // Same refresh token
        user: {
          id: user.id,
          militaryId: user.military.id,
          role: user.role,
        },
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
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
}
