import { LoggerProtocol } from "../../../application/protocols";
import { UserCredentialsInputDTO } from "../../../domain/dtos";
import { AuthenticateUserUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface AuthenticateUserControllerProps {
  authenticateUserService: AuthenticateUserUseCase;
  logger: LoggerProtocol;
}

export class AuthenticateUserController extends BaseController {
  constructor(private readonly props: AuthenticateUserControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<UserCredentialsInputDTO>,
  ): Promise<HttpResponse> {
    const { authenticateUserService } = this.props;

    this.logger.info("Recebida requisição para autenticar usuário", {
      rg: request.body?.rg,
      password: "senha oculta",
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const authenticatedUser =
          await authenticateUserService.authenticate(body);
        this.logger.info("Usuário autenticado com sucesso", {
          userId: authenticatedUser?.id,
          role: authenticatedUser?.role,
        });
        return ok(authenticatedUser);
      },
      "Erro ao autenticar usuário",
      { rg: body.rg },
    );

    return result as HttpResponse;
  }
}
