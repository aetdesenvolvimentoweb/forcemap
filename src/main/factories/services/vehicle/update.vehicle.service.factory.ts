import { UpdateVehicleService } from "../../../../application/services";
import { makeVehicleRepository } from "../../repositories";
import {
  makeIdSanitizer,
  makeVehicleInputDTOSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeVehicleIdRegisteredValidator,
  makeVehicleInputDTOValidator,
} from "../../validators";

export const makeUpdateVehicleService = (): UpdateVehicleService => {
  const vehicleRepository = makeVehicleRepository();

  // Custom implementation for Update service due to different parameter names
  return new UpdateVehicleService({
    vehicleRepository,
    idSanitizer: makeIdSanitizer(),
    dataSanitizer: makeVehicleInputDTOSanitizer(),
    idValidator: makeIdValidator(),
    idRegisteredValidator: makeVehicleIdRegisteredValidator(vehicleRepository),
    dataValidator: makeVehicleInputDTOValidator(vehicleRepository),
  });
};
