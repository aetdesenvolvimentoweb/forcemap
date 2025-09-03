import { LoggerProtocol } from "../../../application/protocols";
import { VehicleInputDTO } from "../../../domain/dtos";
import { CreateVehicleUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest } from "../../utils";
import { BaseController } from "../base.controller";

interface CreateVehicleControllerProps {
  createVehicleService: CreateVehicleUseCase;
  logger: LoggerProtocol;
}

export class CreateVehicleController extends BaseController {
  constructor(private readonly props: CreateVehicleControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<VehicleInputDTO>,
  ): Promise<HttpResponse> {
    const { createVehicleService } = this.props;

    this.logger.info("Recebida requisição para criar viatura", {
      body: request.body,
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await createVehicleService.create(body);
        this.logger.info("Viatura criada com sucesso", {
          name: body.name,
          situation: body.situation,
          complement: body.complement,
        });
        return created();
      },
      "Erro ao criar viatura",
      body,
    );

    return result as HttpResponse;
  }
}
