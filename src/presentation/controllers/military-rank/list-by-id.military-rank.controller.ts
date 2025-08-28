import { MilitaryRank } from "src/domain/entities";

import { LoggerProtocol } from "../../../application/protocols";
import { ListByIdMilitaryRankUseCase } from "../../../domain/use-cases";
import { ControllerProtocol, HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, handleError, ok } from "../../utils";

interface ListByIdMilitaryRankControllerProps {
  listByIdMilitaryRankService: ListByIdMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class ListByIdMilitaryRankController implements ControllerProtocol {
  constructor(private readonly props: ListByIdMilitaryRankControllerProps) {}

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { listByIdMilitaryRankService, logger } = this.props;

    try {
      logger.info("Recebida requisição para listar posto/graduação por ID");

      if (!request.params || !request.params.id) {
        logger.error("Campos obrigatórios não fornecido");
        return emptyRequest();
      }

      const { id } = request.params;

      const militaryRank = (await listByIdMilitaryRankService.listById(
        id,
      )) as MilitaryRank;

      logger.info("Posto/graduação encontrado com sucesso");
      return ok<MilitaryRank>(militaryRank);
    } catch (error: unknown) {
      logger.error("Erro ao listar posto/graduação", { error });
      return handleError(error);
    }
  }
}
