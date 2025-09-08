import { UserRepository } from "../../src/domain/repositories";

export const mockUserRepository = (): jest.Mocked<UserRepository> => ({
  create: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findByIdWithPassword: jest.fn(),
  findByMilitaryId: jest.fn(),
  findByMilitaryIdWithPassword: jest.fn(),
  listAll: jest.fn(),
  updateUserPassword: jest.fn(),
  updateUserRole: jest.fn(),
});
