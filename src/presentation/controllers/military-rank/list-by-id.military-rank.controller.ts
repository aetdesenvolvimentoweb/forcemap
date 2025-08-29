import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryRank } from "../../../domain/entities";
import { ListByIdMilitaryRankUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface ListByIdMilitaryRankControllerProps {
  listByIdMilitaryRankService: ListByIdMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class ListByIdMilitaryRankController extends BaseController {
  constructor(private readonly props: ListByIdMilitaryRankControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { listByIdMilitaryRankService } = this.props;

    this.logger.info("Recebida requisição para listar posto/graduação por ID", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const militaryRank = await listByIdMilitaryRankService.listById(id);
        this.logger.info("Posto/graduação encontrado com sucesso", {
          id,
          found: !!militaryRank,
        });
        return ok<MilitaryRank | null>(militaryRank);
      },
      "Erro ao listar posto/graduação",
      { id },
    );

    return result as HttpResponse;
  }
}
