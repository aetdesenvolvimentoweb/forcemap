import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { UpdateMilitaryRankUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateMilitaryRankControllerProps {
  updateMilitaryRankService: UpdateMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class UpdateMilitaryRankController extends BaseController {
  constructor(private readonly props: UpdateMilitaryRankControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<MilitaryRankInputDTO>,
  ): Promise<HttpResponse> {
    const { updateMilitaryRankService } = this.props;

    this.logger.info("Recebida requisição para atualizar posto/graduação", {
      params: request.params,
      body: request.body,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateMilitaryRankService.update(id, body);
        this.logger.info("Posto/graduação atualizado com sucesso", {
          id,
          abbreviation: body.abbreviation,
          order: body.order,
        });
        return noContent();
      },
      "Erro ao atualizar posto/graduação",
      { id, data: body },
    );

    return result as HttpResponse;
  }
}
