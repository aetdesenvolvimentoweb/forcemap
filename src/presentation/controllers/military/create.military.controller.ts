import { LoggerProtocol } from "../../../application/protocols";
import { MilitaryInputDTO } from "../../../domain/dtos";
import { CreateMilitaryUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest } from "../../utils";
import { BaseController } from "../base.controller";

interface CreateMilitaryControllerProps {
  createMilitaryService: CreateMilitaryUseCase;
  logger: LoggerProtocol;
}

export class CreateMilitaryController extends BaseController {
  constructor(private readonly props: CreateMilitaryControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<MilitaryInputDTO>,
  ): Promise<HttpResponse> {
    const { createMilitaryService } = this.props;

    this.logger.info("Recebida requisição para criar militar", {
      body: request.body,
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await createMilitaryService.create(body);
        this.logger.info("Militar criado com sucesso", {
          militaryRankId: body.militaryRankId,
          rg: body.rg,
          name: body.name,
        });
        return created();
      },
      "Erro ao criar militar",
      body,
    );

    return result as HttpResponse;
  }
}
