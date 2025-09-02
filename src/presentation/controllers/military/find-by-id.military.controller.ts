import { LoggerProtocol } from "../../../application/protocols";
import { Military } from "../../../domain/entities";
import { FindByIdMilitaryUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface FindByIdMilitaryControllerProps {
  findByIdMilitaryService: FindByIdMilitaryUseCase;
  logger: LoggerProtocol;
}

export class FindByIdMilitaryController extends BaseController {
  constructor(private readonly props: FindByIdMilitaryControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { findByIdMilitaryService } = this.props;

    this.logger.info("Recebida requisição para listar militar por ID", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const military = await findByIdMilitaryService.findById(id);
        this.logger.info("Militar encontrado com sucesso", {
          id,
          found: !!military,
        });
        return ok<Military | null>(military);
      },
      "Erro ao listar militar",
      { id },
    );

    return result as HttpResponse;
  }
}
