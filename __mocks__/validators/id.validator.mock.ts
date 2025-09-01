import { IdValidatorProtocol } from "../../src/application/protocols";

export const mockIdValidator = (): jest.Mocked<IdValidatorProtocol> => ({
  validate: jest.fn(),
});
