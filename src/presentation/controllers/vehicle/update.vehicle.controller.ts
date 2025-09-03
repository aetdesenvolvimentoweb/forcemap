import { LoggerProtocol } from "../../../application/protocols";
import { VehicleInputDTO } from "../../../domain/dtos";
import { UpdateVehicleUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateVehicleControllerProps {
  updateVehicleService: UpdateVehicleUseCase;
  logger: LoggerProtocol;
}

export class UpdateVehicleController extends BaseController {
  constructor(private readonly props: UpdateVehicleControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<VehicleInputDTO>,
  ): Promise<HttpResponse> {
    const { updateVehicleService } = this.props;

    this.logger.info("Recebida requisição para atualizar viatura", {
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
        await updateVehicleService.update(id, body);
        this.logger.info("Viatura atualizada com sucesso", {
          id,
          name: body.name,
          situation: body.situation,
          complement: body.complement,
        });
        return noContent();
      },
      "Erro ao atualizar viatura",
      { id, data: body },
    );

    return result as HttpResponse;
  }
}
