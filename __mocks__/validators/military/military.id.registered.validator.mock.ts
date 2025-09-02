import { MilitaryIdRegisteredValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryIdRegisteredValidator =
  (): jest.Mocked<MilitaryIdRegisteredValidatorProtocol> => ({
    validate: jest.fn(),
  });
