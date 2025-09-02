import { FindByIdMilitaryUseCase } from "../../../src/domain/use-cases";

export const mockFindByIdMilitaryService =
  (): jest.Mocked<FindByIdMilitaryUseCase> => ({
    findById: jest.fn(),
  });
