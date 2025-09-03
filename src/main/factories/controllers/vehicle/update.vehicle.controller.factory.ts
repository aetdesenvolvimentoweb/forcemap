import { UpdateVehicleController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateVehicleService } from "../../services";

export const makeUpdateVehicleController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateVehicleService = makeUpdateVehicleService();

  return new UpdateVehicleController({
    updateVehicleService,
    logger,
  });
};
