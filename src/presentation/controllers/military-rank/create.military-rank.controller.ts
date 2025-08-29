import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { CreateMilitaryRankUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest } from "../../utils";
import { BaseController } from "../base.controller";

interface CreateMilitaryRankControllerProps {
  createMilitaryRankService: CreateMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class CreateMilitaryRankController extends BaseController {
  constructor(private readonly props: CreateMilitaryRankControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<MilitaryRankInputDTO>,
  ): Promise<HttpResponse> {
    const { createMilitaryRankService } = this.props;

    this.logger.info("Recebida requisição para criar posto/graduação", {
      body: request.body,
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await createMilitaryRankService.create(body);
        this.logger.info("Posto/graduação criado com sucesso", {
          abbreviation: body.abbreviation,
          order: body.order,
        });
        return created();
      },
      "Erro ao criar posto/graduação",
      body,
    );

    return result as HttpResponse;
  }
}
