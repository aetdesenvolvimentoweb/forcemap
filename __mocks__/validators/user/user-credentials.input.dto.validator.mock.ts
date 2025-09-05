import { UserCredentialsInputDTOValidatorProtocol } from "../../../src/application/protocols";

export const mockUserCredentialsInputDTOValidator =
  (): jest.Mocked<UserCredentialsInputDTOValidatorProtocol> => ({
    validate: jest.fn(),
  });
