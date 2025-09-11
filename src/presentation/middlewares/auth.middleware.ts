import { JWTProtocol, LoggerProtocol } from "../../application/protocols";
import { UnauthorizedError } from "../../domain/errors";
import { SessionRepository } from "../../domain/repositories";
import { HttpRequest, HttpResponse } from "../protocols";
import { badRequest } from "../utils";

interface AuthMiddlewareProps {
  jwtService: JWTProtocol;
  sessionRepository: SessionRepository;
  logger: LoggerProtocol;
}

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
  headers?: { [key: string]: string | string[] | undefined };
}

export class AuthMiddleware {
  constructor(private readonly props: AuthMiddlewareProps) {}

  public authenticate = async (
    request: AuthenticatedRequest,
  ): Promise<AuthenticatedRequest | HttpResponse> => {
    const { jwtService, sessionRepository, logger } = this.props;

    try {
      const authHeader = request.headers?.authorization as string;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Token de autorização ausente ou inválido");
        return badRequest(
          new UnauthorizedError("Token de autorização necessário"),
        );
      }

      const token = authHeader.substring(7);

      if (!token) {
        logger.warn("Token vazio");
        return badRequest(new UnauthorizedError("Token inválido"));
      }

      const payload = jwtService.verifyAccessToken(token);

      const session = await sessionRepository.findByToken(token);

      if (!session) {
        logger.warn("Sessão não encontrada ou inativa", {
          userId: payload.userId,
        });
        return badRequest(new UnauthorizedError("Sessão inválida"));
      }

      if (!session.isActive) {
        logger.warn("Sessão inativa", {
          sessionId: session.id,
          userId: payload.userId,
        });
        return badRequest(new UnauthorizedError("Sessão expirada"));
      }

      await sessionRepository.updateLastAccess(session.id);

      request.user = {
        userId: payload.userId,
        sessionId: session.id,
        role: payload.role,
        militaryId: payload.militaryId,
      };

      logger.info("Usuário autenticado com sucesso", {
        userId: payload.userId,
        role: payload.role,
        sessionId: session.id,
      });

      return request;
    } catch (error) {
      logger.error("Erro na autenticação", { error });
      return badRequest(new UnauthorizedError("Falha na autenticação"));
    }
  };

  public authorize = (allowedRoles: string[]) => {
    const { logger } = this.props;

    return (
      request: AuthenticatedRequest,
    ): AuthenticatedRequest | HttpResponse => {
      if (!request.user) {
        logger.warn("Tentativa de autorização sem usuário autenticado");
        return badRequest(new UnauthorizedError("Usuário não autenticado"));
      }

      if (!allowedRoles.includes(request.user.role)) {
        logger.warn("Acesso negado - papel insuficiente", {
          userId: request.user.userId,
          userRole: request.user.role,
          requiredRoles: allowedRoles,
        });
        return badRequest(new UnauthorizedError("Acesso negado"));
      }

      logger.debug?.("Usuário autorizado", {
        userId: request.user.userId,
        role: request.user.role,
        allowedRoles,
      });

      return request;
    };
  };
}
