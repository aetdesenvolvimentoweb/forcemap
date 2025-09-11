import { MilitaryDeletionPermissionValidatorProtocol } from "../../../src/application/protocols";

export const mockMilitaryDeletionPermissionValidator =
  (): jest.Mocked<MilitaryDeletionPermissionValidatorProtocol> => ({
    validate: jest.fn(),
  });
