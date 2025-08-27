import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryRank } from "../../../domain/entities";
import { ListAllMilitaryRankUseCase } from "../../../domain/use-cases";
import { ControllerProtocol, HttpResponse } from "../../protocols";
import { handleError, ok } from "../../utils";

interface ListAllMilitaryRankControllerProps {
  listAllMilitaryRankService: ListAllMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class ListAllMilitaryRankController
  implements ControllerProtocol<MilitaryRank[]>
{
  constructor(private readonly props: ListAllMilitaryRankControllerProps) {}

  public async handle(): Promise<HttpResponse | HttpResponse<MilitaryRank[]>> {
    const { listAllMilitaryRankService, logger } = this.props;

    try {
      logger.info("Recebida requisição para listar todos os postos/graduações");
      const militaryRanks = await listAllMilitaryRankService.listAll();

      logger.info("Postos/graduações listados com sucesso");
      return ok<MilitaryRank[]>(militaryRanks);
    } catch (error: unknown) {
      logger.error("Erro ao listar postos/graduações", { error });
      return handleError(error);
    }
  }
}
