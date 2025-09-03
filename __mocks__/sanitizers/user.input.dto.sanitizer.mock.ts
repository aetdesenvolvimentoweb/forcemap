import { UserInputDTOSanitizerProtocol } from "../../src/application/protocols";

export const mockUserInputDTOSanitizer =
  (): jest.Mocked<UserInputDTOSanitizerProtocol> => ({
    sanitize: jest.fn(),
  });
