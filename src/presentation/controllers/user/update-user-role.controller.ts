import { LoggerProtocol } from "../../../application/protocols";
import { UserRole } from "../../../domain/entities";
import { UpdateUserRoleUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, forbidden, noContent } from "../../utils";
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
    request: HttpRequest<{ role: UserRole }>,
  ): Promise<HttpResponse> {
    const { updateUserRoleService } = this.props;

    this.logger.info("Recebida requisição para atualizar função do usuário", {
      params: request.params,
      body: {
        role: request.body?.role,
      },
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    // Verifica se o usuário está autenticado
    if (!request.user) {
      this.logger.warn("Tentativa de atualizar função sem autenticação", {
        id,
      });
      return forbidden("Usuário não autenticado");
    }

    // Chefe não pode promover usuários para Admin (escalação de privilégios)
    if (request.user.role === "Chefe" && body.role === "Admin") {
      this.logger.warn(
        "Chefe tentou promover usuário para Admin (escalação de privilégios bloqueada)",
        {
          requestingUserId: request.user.userId,
          requestingUserRole: request.user.role,
          targetUserId: id,
          targetRole: body.role,
        },
      );
      return forbidden(
        "Chefes não podem promover usuários para Admin. Apenas Admin pode criar outros Admins.",
      );
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateUserRoleService.updateUserRole(id, body.role);
        this.logger.info("Função do usuário atualizada com sucesso", {
          id,
          role: body.role,
          updatedBy: request.user?.userId,
        });
        return noContent();
      },
      "Erro ao atualizar função do usuário",
      { id, role: body.role },
    );

    return result as HttpResponse;
  }
}
