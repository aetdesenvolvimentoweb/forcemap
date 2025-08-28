import { MilitaryRankInputDTO } from "src/domain/dtos";

import { LoggerProtocol } from "../../../application/protocols";
import { UpdateMilitaryRankUseCase } from "../../../domain/use-cases";
import { ControllerProtocol, HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, handleError, noContent } from "../../utils";

interface UpdateMilitaryRankControllerProps {
  updateMilitaryRankService: UpdateMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class UpdateMilitaryRankController implements ControllerProtocol {
  constructor(private readonly props: UpdateMilitaryRankControllerProps) {}

  public async handle(
    request: HttpRequest<MilitaryRankInputDTO> & { params: { id: string } },
  ): Promise<HttpResponse> {
    const { updateMilitaryRankService, logger } = this.props;

    try {
      logger.info("Recebida requisição para atualizar posto/graduação");

      if (!request.params || !request.params.id) {
        logger.error("Campo obrigatório não fornecido");
        return emptyRequest();
      }

      if (!request.body || !request.body.data) {
        logger.error("Campos obrigatórios não fornecidos");
        return emptyRequest();
      }

      const { id } = request.params;
      const { data } = request.body;

      await updateMilitaryRankService.update(id, data);

      logger.info("Posto/graduação atualizado com sucesso");
      return noContent();
    } catch (error: unknown) {
      logger.error("Erro ao atualizar posto/graduação", { error });
      return handleError(error);
    }
  }
}
