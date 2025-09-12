import {
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../domain/dtos/auth";
import { UserRepository } from "../../../domain/repositories";
import { EntityNotFoundError, UnauthorizedError } from "../../errors";
import { TokenHandlerProtocol } from "../../protocols";
import { SessionService } from "./session.service";

interface RefreshTokenServiceDependencies {
  userRepository: UserRepository;
  sessionService: SessionService;
  tokenHandler: TokenHandlerProtocol;
}

export class RefreshTokenService {
  constructor(private readonly dependencies: RefreshTokenServiceDependencies) {}

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
}
