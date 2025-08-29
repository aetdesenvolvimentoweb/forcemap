import { LoggerProtocol } from "../../../application/protocols";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface DeleteMilitaryRankControllerProps {
  deleteMilitaryRankService: DeleteMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class DeleteMilitaryRankController extends BaseController {
  constructor(private readonly props: DeleteMilitaryRankControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { deleteMilitaryRankService } = this.props;

    this.logger.info("Recebida requisição para deletar posto/graduação");

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await deleteMilitaryRankService.delete(id);
        this.logger.info("Posto/graduação deletado com sucesso", { id });
        return noContent();
      },
      "Erro ao deletar posto/graduação",
      { id },
    );

    return result as HttpResponse;
  }
}
