import { LoggerProtocol } from "../../../application/protocols";
import { AuthService } from "../../../application/services/auth/auth.service";
import { HttpRequest, HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

interface LogoutControllerProps {
  authService: AuthService;
  logger: LoggerProtocol;
}

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
}

export class LogoutController extends BaseController {
  constructor(private readonly props: LogoutControllerProps) {
    super(props.logger);
  }

  public async handle(request: AuthenticatedRequest): Promise<HttpResponse> {
    const { authService } = this.props;
    const sessionId = request.user?.sessionId;

    this.logger.info("Recebida requisição para logout", {
      userId: request.user?.userId,
      sessionId: sessionId,
    });

    const result = await this.executeWithErrorHandling(
      async () => {
        if (sessionId) {
          await authService.logout(sessionId);
        }

        this.logger.info("Logout realizado com sucesso", {
          userId: request.user?.userId,
          sessionId: sessionId,
        });

        return ok({ message: "Logout realizado com sucesso" });
      },
      "Erro ao realizar logout",
      { userId: request.user?.userId },
    );

    return result as HttpResponse;
  }
}
