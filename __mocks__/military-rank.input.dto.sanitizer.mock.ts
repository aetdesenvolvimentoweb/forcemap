import { MilitaryRankInputDTOSanitizerProtocol } from "../src/application/protocols";

export const mockMilitaryRankInputDTOSanitizer =
  (): jest.Mocked<MilitaryRankInputDTOSanitizerProtocol> => ({
    sanitize: jest.fn(),
  });
