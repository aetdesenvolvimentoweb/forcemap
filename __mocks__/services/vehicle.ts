import { VehicleInputDTO } from "../../src/domain/dtos";
import { Vehicle } from "../../src/domain/entities";
import {
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  FindByIdVehicleUseCase,
  ListAllVehicleUseCase,
  UpdateVehicleUseCase,
} from "../../src/domain/use-cases";

export const mockCreateVehicleService =
  (): jest.Mocked<CreateVehicleUseCase> => ({
    create: jest.fn(),
  });

export const mockDeleteVehicleService =
  (): jest.Mocked<DeleteVehicleUseCase> => ({
    delete: jest.fn(),
  });

export const mockFindByIdVehicleService =
  (): jest.Mocked<FindByIdVehicleUseCase> => ({
    findById: jest.fn(),
  });

export const mockListAllVehicleService =
  (): jest.Mocked<ListAllVehicleUseCase> => ({
    listAll: jest.fn(),
  });

export const mockUpdateVehicleService =
  (): jest.Mocked<UpdateVehicleUseCase> => ({
    update: jest.fn(),
  });
