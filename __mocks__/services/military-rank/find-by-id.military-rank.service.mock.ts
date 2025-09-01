import { FindByIdMilitaryRankUseCase } from "../../../src/domain/use-cases";

export const mockFindByIdMilitaryRankService =
  (): jest.Mocked<FindByIdMilitaryRankUseCase> => ({
    findById: jest.fn(),
  });
