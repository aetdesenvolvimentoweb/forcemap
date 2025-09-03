import { VehicleInputDTOSanitizerProtocol } from "../../src/application/protocols";

export const mockVehicleInputDTOSanitizer =
  (): jest.Mocked<VehicleInputDTOSanitizerProtocol> => ({
    sanitize: jest.fn(),
  });
