import { UpdateMilitaryUseCase } from "../../../src/domain/use-cases";

export const mockUpdateMilitaryService =
  (): jest.Mocked<UpdateMilitaryUseCase> => ({
    update: jest.fn(),
  });
