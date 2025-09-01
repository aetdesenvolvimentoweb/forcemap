import { MilitaryRankRepository } from "../src/domain/repositories";

export const mockMilitaryRankRepository =
  (): jest.Mocked<MilitaryRankRepository> => ({
    create: jest.fn(),
    delete: jest.fn(),
    findByAbbreviation: jest.fn(),
    findById: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn(),
    update: jest.fn(),
  });
