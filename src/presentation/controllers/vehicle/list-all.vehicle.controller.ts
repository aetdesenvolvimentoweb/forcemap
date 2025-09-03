import { LoggerProtocol } from "../../../application/protocols";
import { Vehicle } from "../../../domain/entities";
import { ListAllVehicleUseCase } from "../../../domain/use-cases";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

interface ListAllVehicleControllerProps {
  listAllVehicleService: ListAllVehicleUseCase;
  logger: LoggerProtocol;
}

export class ListAllVehicleController extends BaseController {
  constructor(private readonly props: ListAllVehicleControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse> {
    const { listAllVehicleService } = this.props;

    this.logger.info("Recebida requisição para listar todas as viaturas");

    const result = await this.executeWithErrorHandling(async () => {
      const Vehicles = await listAllVehicleService.listAll();
      this.logger.info("Viaturas listadas com sucesso", {
        count: Vehicles.length,
      });
      return ok<Vehicle[]>(Vehicles);
    }, "Erro ao listar viaturas");

    return result as HttpResponse;
  }
}
