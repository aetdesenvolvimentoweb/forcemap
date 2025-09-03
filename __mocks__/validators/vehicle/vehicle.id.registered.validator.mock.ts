import { VehicleIdRegisteredValidatorProtocol } from "../../../src/application/protocols";

export const mockVehicleIdRegisteredValidator =
  (): jest.Mocked<VehicleIdRegisteredValidatorProtocol> => ({
    validate: jest.fn(),
  });
