import { CreateVehicleController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeCreateVehicleService } from "../../services";

export const makeCreateVehicleController = (): ControllerProtocol => {
  const logger = makeLogger();
  const createVehicleService = makeCreateVehicleService();

  return new CreateVehicleController({
    createVehicleService,
    logger,
  });
};
