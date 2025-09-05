import { UserCredentialsInputDTOSanitizerProtocol } from "../../src/application/protocols";

export const mockUserCredentialsInputDTOSanitizer =
  (): jest.Mocked<UserCredentialsInputDTOSanitizerProtocol> => ({
    sanitize: jest.fn(),
  });
