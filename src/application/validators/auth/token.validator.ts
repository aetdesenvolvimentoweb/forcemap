import { UserSession } from "../../../domain/entities";
import { UnauthorizedError } from "../../../domain/errors";
import { SessionRepository } from "../../../domain/repositories";
import {
  RefreshTokenPayload,
  TokenPayload,
} from "../../adapters/token.adapter";
import { JWTProtocol, LoggerProtocol } from "../../protocols";

interface TokenValidatorDependencies {
  jwtService: JWTProtocol;
  sessionRepository: SessionRepository;
  logger: LoggerProtocol;
}

export interface ValidatedTokenResult {
  payload: TokenPayload;
  sessionId: string;
}

export class TokenValidator {
  constructor(private readonly dependencies: TokenValidatorDependencies) {}

  public readonly validateAccessToken = async (
    authHeader: string,
  ): Promise<ValidatedTokenResult> => {
    const { jwtService, sessionRepository, logger } = this.dependencies;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Token de autorização ausente ou inválido");
      throw new UnauthorizedError("Token de autorização necessário");
    }

    const token = authHeader.substring(7);

    if (!token) {
      logger.warn("Token vazio");
      throw new UnauthorizedError("Token inválido");
    }

    try {
      const payload = jwtService.verifyAccessToken(token);

      const session = await sessionRepository.findByToken(token);

      if (!session) {
        logger.warn("Sessão não encontrada para o token", {
          token: token.substring(0, 10) + "...",
        });
        throw new UnauthorizedError("Sessão não encontrada");
      }

      if (!session.isActive) {
        logger.warn("Sessão inativa", {
          sessionId: session.id,
          userId: payload.userId,
        });
        throw new UnauthorizedError("Sessão expirada");
      }

      return {
        payload,
        sessionId: session.id,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error("Erro na validação do token", { error });
      throw new UnauthorizedError("Token inválido");
    }
  };

  public readonly validateRefreshToken = async (
    refreshToken: string,
  ): Promise<{ payload: RefreshTokenPayload; session: UserSession }> => {
    const { jwtService, sessionRepository, logger } = this.dependencies;

    try {
      const payload = jwtService.verifyRefreshToken(refreshToken);

      const session = await sessionRepository.findByRefreshToken(refreshToken);

      if (!session || !session.isActive) {
        logger.warn("Sessão inválida para refresh token");
        throw new UnauthorizedError("Sessão inválida ou expirada");
      }

      return {
        payload,
        session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error("Erro na validação do refresh token", { error });
      throw new UnauthorizedError("Refresh token inválido");
    }
  };
}
