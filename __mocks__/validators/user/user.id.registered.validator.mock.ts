import { UserIdRegisteredValidatorProtocol } from "../../../src/application/protocols";

export const mockUserIdRegisteredValidator =
  (): jest.Mocked<UserIdRegisteredValidatorProtocol> => ({
    validate: jest.fn(),
  });
