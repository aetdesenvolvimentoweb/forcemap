import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryInputDTO } from "../../../domain/dtos";
import { UpdateMilitaryUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateMilitaryControllerProps {
  updateMilitaryService: UpdateMilitaryUseCase;
  logger: LoggerProtocol;
}

export class UpdateMilitaryController extends BaseController {
  constructor(private readonly props: UpdateMilitaryControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<MilitaryInputDTO>,
  ): Promise<HttpResponse> {
    const { updateMilitaryService } = this.props;

    this.logger.info("Recebida requisição para atualizar militar", {
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
        await updateMilitaryService.update(id, body);
        this.logger.info("Militar atualizado com sucesso", {
          id,
          militaryRankId: body.militaryRankId,
          rg: body.rg,
          name: body.name,
        });
        return noContent();
      },
      "Erro ao atualizar militar",
      { id, data: body },
    );

    return result as HttpResponse;
  }
}
