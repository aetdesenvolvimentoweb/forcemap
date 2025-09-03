import {
  CreateMilitaryRankUseCase,
  DeleteMilitaryRankUseCase,
  FindByIdMilitaryRankUseCase,
  ListAllMilitaryRankUseCase,
  UpdateMilitaryRankUseCase,
} from "../../src/domain/use-cases";

export const mockCreateMilitaryRankService =
  (): jest.Mocked<CreateMilitaryRankUseCase> => ({
    create: jest.fn(),
  });

export const mockDeleteMilitaryRankService =
  (): jest.Mocked<DeleteMilitaryRankUseCase> => ({
    delete: jest.fn(),
  });

export const mockFindByIdMilitaryRankService =
  (): jest.Mocked<FindByIdMilitaryRankUseCase> => ({
    findById: jest.fn(),
  });

export const mockListAllMilitaryRankService =
  (): jest.Mocked<ListAllMilitaryRankUseCase> => ({
    listAll: jest.fn(),
  });

export const mockUpdateMilitaryRankService =
  (): jest.Mocked<UpdateMilitaryRankUseCase> => ({
    update: jest.fn(),
  });
