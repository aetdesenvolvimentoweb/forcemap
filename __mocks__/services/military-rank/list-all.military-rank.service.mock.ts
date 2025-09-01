import { ListAllMilitaryRankUseCase } from "../../../src/domain/use-cases";

export const mockListAllMilitaryRankService =
  (): jest.Mocked<ListAllMilitaryRankUseCase> => ({
    listAll: jest.fn(),
  });
