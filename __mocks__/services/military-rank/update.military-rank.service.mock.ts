import { UpdateMilitaryRankUseCase } from "../../../src/domain/use-cases";

export const mockUpdateMilitaryRankService =
  (): jest.Mocked<UpdateMilitaryRankUseCase> => ({
    update: jest.fn(),
  });
