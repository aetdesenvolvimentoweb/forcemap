import { VehicleInputDTOValidatorProtocol } from "../../../src/application/protocols";

export const mockVehicleInputDTOValidator =
  (): jest.Mocked<VehicleInputDTOValidatorProtocol> => ({
    validate: jest.fn(),
  });
