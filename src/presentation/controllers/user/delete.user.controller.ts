import { LoggerProtocol } from "../../../application/protocols";
import { DeleteUserUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface DeleteUserControllerProps {
  deleteUserService: DeleteUserUseCase;
  logger: LoggerProtocol;
}

export class DeleteUserController extends BaseController {
  constructor(private readonly props: DeleteUserControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { deleteUserService } = this.props;

    this.logger.info("Recebida requisição para deletar usuário");

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await deleteUserService.delete(id);
        this.logger.info("Usuário deletado com sucesso", { id });
        return noContent();
      },
      "Erro ao deletar usuário",
      { id },
    );

    return result as HttpResponse;
  }
}
