import { LoginInputDTOSanitizerProtocol } from "../../src/application/protocols";

export const mockLoginInputDTOSanitizer =
  (): jest.Mocked<LoginInputDTOSanitizerProtocol> => ({
    sanitize: jest.fn(),
  });
