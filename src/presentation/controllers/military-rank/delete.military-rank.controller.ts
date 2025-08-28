import { LoggerProtocol } from "../../../application/protocols";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import { ControllerProtocol, HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest, handleError, noContent } from "../../utils";

interface DeleteMilitaryRankControllerProps {
  deleteMilitaryRankService: DeleteMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class DeleteMilitaryRankController implements ControllerProtocol {
  constructor(private readonly props: DeleteMilitaryRankControllerProps) {}

  public async handle(
    request: HttpRequest & { params: { id: string } },
  ): Promise<HttpResponse> {
    const { deleteMilitaryRankService, logger } = this.props;

    try {
      logger.info("Recebida requisição para deletar posto/graduação");

      if (!request.params || !request.params.id) {
        logger.error("Campos obrigatórios não fornecido");
        return emptyRequest();
      }

      const { id } = request.params;

      await deleteMilitaryRankService.delete(id);

      logger.info("Posto/graduação deletado com sucesso");
      return noContent();
    } catch (error: unknown) {
      logger.error("Erro ao deletar posto/graduação", { error });
      return handleError(error);
    }
  }
}
