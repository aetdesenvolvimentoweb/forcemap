import { PasswordHasherProtocol } from "../../src/application/protocols";

export const mockPasswordHasher = (): jest.Mocked<PasswordHasherProtocol> => ({
  compare: jest.fn(),
  hash: jest.fn(),
});
