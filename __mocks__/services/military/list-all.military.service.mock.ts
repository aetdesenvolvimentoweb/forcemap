import { ListAllMilitaryUseCase } from "../../../src/domain/use-cases";

export const mockListAllMilitaryService =
  (): jest.Mocked<ListAllMilitaryUseCase> => ({
    listAll: jest.fn(),
  });
