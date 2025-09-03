import { CreateVehicleService } from "../../../../application/services";
import { makeVehicleRepository } from "../../repositories";
import { makeVehicleInputDTOSanitizer } from "../../sanitizers";
import { makeVehicleInputDTOValidator } from "../../validators";

export const makeCreateVehicleService = (): CreateVehicleService => {
  const vehicleRepository = makeVehicleRepository();
  const sanitizer = makeVehicleInputDTOSanitizer();
  const validator = makeVehicleInputDTOValidator(vehicleRepository);

  return new CreateVehicleService({
    vehicleRepository,
    sanitizer,
    validator,
  });
};
