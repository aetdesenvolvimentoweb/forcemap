import { VehicleIdRegisteredValidatorProtocol } from "../../../../application/protocols";
import { VehicleIdRegisteredValidator } from "../../../../application/validators";
import { VehicleRepository } from "../../../../domain/repositories";

export const makeVehicleIdRegisteredValidator = (
  vehicleRepository: VehicleRepository,
): VehicleIdRegisteredValidatorProtocol => {
  return new VehicleIdRegisteredValidator({
    vehicleRepository,
  });
};
