import { LoggerProtocol } from "../../../application/protocols";
import { DeleteMilitaryUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface DeleteMilitaryControllerProps {
  deleteMilitaryService: DeleteMilitaryUseCase;
  logger: LoggerProtocol;
}

export class DeleteMilitaryController extends BaseController {
  constructor(private readonly props: DeleteMilitaryControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { deleteMilitaryService } = this.props;

    this.logger.info("Recebida requisição para deletar militar");

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await deleteMilitaryService.delete(id);
        this.logger.info("Militar deletado com sucesso", { id });
        return noContent();
      },
      "Erro ao deletar militar",
      { id },
    );

    return result as HttpResponse;
  }
}
