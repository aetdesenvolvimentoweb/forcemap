import { FindByIdVehicleService } from "../../../../application/services";
import { makeVehicleRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeVehicleIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdVehicleService = (): FindByIdVehicleService => {
  const vehicleRepository = makeVehicleRepository();
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeVehicleIdRegisteredValidator(vehicleRepository);

  return new FindByIdVehicleService({
    vehicleRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
