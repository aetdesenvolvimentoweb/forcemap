import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryRank } from "../../../domain/entities";
import { ListAllMilitaryRankUseCase } from "../../../domain/use-cases";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

interface ListAllMilitaryRankControllerProps {
  listAllMilitaryRankService: ListAllMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class ListAllMilitaryRankController extends BaseController {
  constructor(private readonly props: ListAllMilitaryRankControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse> {
    const { listAllMilitaryRankService } = this.props;

    this.logger.info(
      "Recebida requisição para listar todos os postos/graduações",
    );

    const result = await this.executeWithErrorHandling(async () => {
      const militaryRanks = await listAllMilitaryRankService.listAll();
      this.logger.info("Postos/graduações listados com sucesso", {
        count: militaryRanks.length,
      });
      return ok<MilitaryRank[]>(militaryRanks);
    }, "Erro ao listar postos/graduações");

    return result as HttpResponse;
  }
}
