import { VehicleInputDTOValidatorProtocol } from "../../../../application/protocols";
import { VehicleInputDTOValidator } from "../../../../application/validators";
import { VehicleRepository } from "../../../../domain/repositories";

export const makeVehicleInputDTOValidator = (
  vehicleRepository: VehicleRepository,
): VehicleInputDTOValidatorProtocol => {
  return new VehicleInputDTOValidator({
    vehicleRepository,
  });
};
