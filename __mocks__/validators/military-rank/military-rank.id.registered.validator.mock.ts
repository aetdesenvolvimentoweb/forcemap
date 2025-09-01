import { MilitaryRankIdRegisteredValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryRankIdRegisteredValidator =
  (): jest.Mocked<MilitaryRankIdRegisteredValidatorProtocol> => ({
    validate: jest.fn(),
  });
