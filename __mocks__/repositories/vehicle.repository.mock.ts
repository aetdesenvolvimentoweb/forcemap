import { VehicleRepository } from "../../src/domain/repositories";

export const mockVehicleRepository = (): jest.Mocked<VehicleRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  listAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});
