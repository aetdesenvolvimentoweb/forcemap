import { UserInputDTOValidatorProtocol } from "../../../src/application/protocols";

export const mockUserInputDTOValidator =
  (): jest.Mocked<UserInputDTOValidatorProtocol> => ({
    validate: jest.fn(),
  });
