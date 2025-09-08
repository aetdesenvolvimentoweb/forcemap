import { LoggerProtocol } from "../../../application/protocols";
import { UserRole } from "../../../domain/entities";
import { UpdateUserRoleUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateUserRoleControllerProps {
  updateUserRoleService: UpdateUserRoleUseCase;
  logger: LoggerProtocol;
}

export class UpdateUserRoleController extends BaseController {
  constructor(private readonly props: UpdateUserRoleControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<{ userRole: UserRole }>,
  ): Promise<HttpResponse> {
    const { updateUserRoleService } = this.props;

    this.logger.info("Recebida requisição para atualizar função do usuário", {
      params: request.params,
      body: {
        userRole: request.body?.userRole,
      },
    });

    const userId = this.validateRequiredParam(request, "userId");
    if (!userId) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateUserRoleService.updateUserRole(userId, body.userRole);
        this.logger.info("Função do usuário atualizada com sucesso", {
          userId,
          userRole: body.userRole,
        });
        return noContent();
      },
      "Erro ao atualizar função do usuário",
      { userId, data: body },
    );

    return result as HttpResponse;
  }
}
