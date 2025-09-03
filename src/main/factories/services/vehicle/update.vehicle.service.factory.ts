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
  const idSanitizer = makeIdSanitizer();
  const dataSanitizer = makeVehicleInputDTOSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeVehicleIdRegisteredValidator(vehicleRepository);
  const dataValidator = makeVehicleInputDTOValidator(vehicleRepository);

  return new UpdateVehicleService({
    vehicleRepository,
    idSanitizer,
    dataSanitizer,
    idValidator,
    idRegisteredValidator,
    dataValidator,
  });
};
