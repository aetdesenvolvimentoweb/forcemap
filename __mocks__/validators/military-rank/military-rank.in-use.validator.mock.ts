import { MilitaryRankInUseValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryRankInUseValidator =
  (): jest.Mocked<MilitaryRankInUseValidatorProtocol> => ({
    validate: jest.fn(),
  });
