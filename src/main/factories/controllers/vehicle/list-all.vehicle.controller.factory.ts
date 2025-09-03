import { ListAllVehicleController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListAllVehicleService } from "../../services";

export const makeListAllVehicleController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listAllVehicleService = makeListAllVehicleService();

  return new ListAllVehicleController({
    listAllVehicleService,
    logger,
  });
};
