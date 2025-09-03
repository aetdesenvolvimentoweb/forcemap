import { VehicleRepository } from "../../../domain/repositories";
import { VehicleRepositoryInMemory } from "../../../infra/repositories";

let instance: VehicleRepositoryInMemory | null = null;

export const makeVehicleRepository = (): VehicleRepository => {
  if (!instance) {
    instance = new VehicleRepositoryInMemory();
  }
  return instance;
};
