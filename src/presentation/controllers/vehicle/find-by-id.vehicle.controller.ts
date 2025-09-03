import { LoggerProtocol } from "../../../application/protocols";
import { Vehicle } from "../../../domain/entities";
import { FindByIdVehicleUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface FindByIdVehicleControllerProps {
  findByIdVehicleService: FindByIdVehicleUseCase;
  logger: LoggerProtocol;
}

export class FindByIdVehicleController extends BaseController {
  constructor(private readonly props: FindByIdVehicleControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { findByIdVehicleService } = this.props;

    this.logger.info("Recebida requisição para listar viatura por ID", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const vehicle = await findByIdVehicleService.findById(id);
        this.logger.info("Viatura encontrada com sucesso", {
          id,
          found: !!vehicle,
        });
        return ok<Vehicle | null>(vehicle);
      },
      "Erro ao listar viatura",
      { id },
    );

    return result as HttpResponse;
  }
}
