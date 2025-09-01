import { MilitaryRankInputDTOValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryRankInputDTOValidator =
  (): jest.Mocked<MilitaryRankInputDTOValidatorProtocol> => ({
    validate: jest.fn(),
  });
