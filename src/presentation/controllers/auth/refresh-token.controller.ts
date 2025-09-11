import { LoggerProtocol } from "../../../application/protocols";
import { AuthService } from "../../../application/services/auth/auth.service";
import { RefreshTokenInputDTO } from "../../../domain/dtos/auth";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface RefreshTokenControllerProps {
  authService: AuthService;
  logger: LoggerProtocol;
}

interface RefreshTokenHttpRequest extends HttpRequest<RefreshTokenInputDTO> {
  ip?: string;
  connection?: { remoteAddress?: string };
  headers?: { [key: string]: string | string[] | undefined };
}

export class RefreshTokenController extends BaseController {
  constructor(private readonly props: RefreshTokenControllerProps) {
    super(props.logger);
  }

  public async handle(request: RefreshTokenHttpRequest): Promise<HttpResponse> {
    const { authService } = this.props;

    this.logger.info("Recebida requisição para renovar token", {
      ip: request.ip,
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const ipAddress =
          request.ip || request.socket?.remoteAddress || "unknown";
        const refreshResult = await authService.refreshToken(body, ipAddress);

        this.logger.info("Token renovado com sucesso", {
          userId: refreshResult.user.id,
          ip: ipAddress,
        });

        return ok(refreshResult);
      },
      "Erro ao renovar token",
      { refreshToken: "hidden" },
    );

    return result as HttpResponse;
  }
}
