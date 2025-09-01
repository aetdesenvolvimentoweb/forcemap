import { IdSanitizerProtocol } from "../../src/application/protocols";

export const mockIdSanitizer = (): jest.Mocked<IdSanitizerProtocol> => ({
  sanitize: jest.fn(),
});
