import {
  CreateMilitaryUseCase,
  DeleteMilitaryUseCase,
  FindByIdMilitaryUseCase,
  ListAllMilitaryUseCase,
  UpdateMilitaryUseCase,
} from "../../src/domain/use-cases";

export const mockCreateMilitaryService =
  (): jest.Mocked<CreateMilitaryUseCase> => ({
    create: jest.fn(),
  });

export const mockDeleteMilitaryService =
  (): jest.Mocked<DeleteMilitaryUseCase> => ({
    delete: jest.fn(),
  });

export const mockFindByIdMilitaryService =
  (): jest.Mocked<FindByIdMilitaryUseCase> => ({
    findById: jest.fn(),
  });

export const mockListAllMilitaryService =
  (): jest.Mocked<ListAllMilitaryUseCase> => ({
    listAll: jest.fn(),
  });

export const mockUpdateMilitaryService =
  (): jest.Mocked<UpdateMilitaryUseCase> => ({
    update: jest.fn(),
  });
