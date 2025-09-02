import { DeleteMilitaryUseCase } from "../../../src/domain/use-cases";

export const mockDeleteMilitaryService =
  (): jest.Mocked<DeleteMilitaryUseCase> => ({
    delete: jest.fn(),
  });
