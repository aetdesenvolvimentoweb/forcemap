import { CreateMilitaryUseCase } from "../../../src/domain/use-cases";

export const mockCreateMilitaryService =
  (): jest.Mocked<CreateMilitaryUseCase> => ({
    create: jest.fn(),
  });
