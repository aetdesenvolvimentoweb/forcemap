import { FindByIdVehicleController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeFindByIdVehicleService } from "../../services";

export const makeFindByIdVehicleController = (): ControllerProtocol => {
  const logger = makeLogger();
  const findByIdVehicleService = makeFindByIdVehicleService();

  return new FindByIdVehicleController({
    findByIdVehicleService,
    logger,
  });
};
