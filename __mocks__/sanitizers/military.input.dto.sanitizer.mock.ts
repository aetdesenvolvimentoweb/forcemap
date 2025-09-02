import { MilitaryInputDTOSanitizerProtocol } from "../../src/application/protocols";

export const mockMilitaryInputDTOSanitizer =
  (): jest.Mocked<MilitaryInputDTOSanitizerProtocol> => ({
    sanitize: jest.fn(),
  });
