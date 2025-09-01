import { CreateMilitaryRankUseCase } from "../../../src/domain/use-cases";

export const mockCreateMilitaryRankService =
  (): jest.Mocked<CreateMilitaryRankUseCase> => ({
    create: jest.fn(),
  });
