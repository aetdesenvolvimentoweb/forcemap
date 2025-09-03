import { LoggerProtocol } from "../../../application/protocols";
import { DeleteVehicleUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface DeleteVehicleControllerProps {
  deleteVehicleService: DeleteVehicleUseCase;
  logger: LoggerProtocol;
}

export class DeleteVehicleController extends BaseController {
  constructor(private readonly props: DeleteVehicleControllerProps) {
    super(props.logger);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const { deleteVehicleService } = this.props;

    this.logger.info("Recebida requisição para deletar viatura");

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await deleteVehicleService.delete(id);
        this.logger.info("Viatura deletada com sucesso", { id });
        return noContent();
      },
      "Erro ao deletar viatura",
      { id },
    );

    return result as HttpResponse;
  }
}
