import { VehicleInputDTOSanitizerProtocol } from "../../../application/protocols";
import { VehicleInputDTOSanitizer } from "../../../application/sanitizers";

export const makeVehicleInputDTOSanitizer =
  (): VehicleInputDTOSanitizerProtocol => {
    return new VehicleInputDTOSanitizer();
  };
