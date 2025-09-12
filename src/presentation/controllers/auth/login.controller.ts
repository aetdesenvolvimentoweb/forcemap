import { LoggerProtocol } from "../../../application/protocols";
import { LoginService } from "../../../application/services/auth/login.service";
import { LoginInputDTO } from "../../../domain/dtos/auth";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface LoginControllerProps {
  loginService: LoginService;
  logger: LoggerProtocol;
}

interface LoginHttpRequest extends HttpRequest<LoginInputDTO> {
  ip?: string;
  connection?: { remoteAddress?: string };
  headers?: { [key: string]: string | string[] | undefined };
}

export class LoginController extends BaseController {
  constructor(private readonly props: LoginControllerProps) {
    super(props.logger);
  }

  public async handle(request: LoginHttpRequest): Promise<HttpResponse> {
    const { loginService } = this.props;

    this.logger.info("Recebida requisição para login", {
      rg: request.body?.rg,
      deviceInfo: request.body?.deviceInfo,
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
        const userAgent =
          (request.headers?.["user-agent"] as string) || "unknown";

        const loginResult = await loginService.authenticate(
          body,
          ipAddress,
          userAgent,
        );

        this.logger.info("Login realizado com sucesso", {
          userId: loginResult.user.id,
          role: loginResult.user.role,
          ip: ipAddress,
        });

        return ok(loginResult);
      },
      "Erro ao realizar login",
      { rg: body.rg },
    );

    return result as HttpResponse;
  }
}
