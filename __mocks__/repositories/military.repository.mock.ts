import { MilitaryRepository } from "../../src/domain/repositories";

export const mockMilitaryRepository = (): jest.Mocked<MilitaryRepository> => ({
  create: jest.fn(),
  delete: jest.fn(),
  findByRg: jest.fn(),
  findById: jest.fn(),
  listAll: jest.fn(),
  update: jest.fn(),
});
