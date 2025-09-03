import { DeleteVehicleService } from "../../../../application/services";
import { makeVehicleRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeVehicleIdRegisteredValidator,
} from "../../validators";

export const makeDeleteVehicleService = (): DeleteVehicleService => {
  const vehicleRepository = makeVehicleRepository();
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeVehicleIdRegisteredValidator(vehicleRepository);

  return new DeleteVehicleService({
    vehicleRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
