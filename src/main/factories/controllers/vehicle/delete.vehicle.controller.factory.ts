import { DeleteVehicleController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeDeleteVehicleService } from "../../services";

export const makeDeleteVehicleController = (): ControllerProtocol => {
  const logger = makeLogger();
  const deleteVehicleService = makeDeleteVehicleService();

  return new DeleteVehicleController({
    deleteVehicleService,
    logger,
  });
};
