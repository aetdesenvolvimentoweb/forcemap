import { MilitaryInUseValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryInUseValidator =
  (): jest.Mocked<MilitaryInUseValidatorProtocol> => ({
    validate: jest.fn(),
  });
