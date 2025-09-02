import { MilitaryInputDTOValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryInputDTOValidator =
  (): jest.Mocked<MilitaryInputDTOValidatorProtocol> => ({
    validate: jest.fn(),
  });
