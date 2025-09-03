import { LoginInputDTOValidatorProtocol } from "../../../src/application/protocols";

export const mockLoginInputDTOValidator =
  (): jest.Mocked<LoginInputDTOValidatorProtocol> => ({
    validate: jest.fn(),
  });
