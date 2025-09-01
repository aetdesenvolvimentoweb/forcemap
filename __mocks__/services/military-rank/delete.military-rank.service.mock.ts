import { DeleteMilitaryRankUseCase } from "../../../src/domain/use-cases";

export const mockDeleteMilitaryRankService =
  (): jest.Mocked<DeleteMilitaryRankUseCase> => ({
    delete: jest.fn(),
  });
