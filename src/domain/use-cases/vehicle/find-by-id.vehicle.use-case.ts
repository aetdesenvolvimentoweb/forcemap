import { Vehicle } from "../../entities";

export interface FindByIdVehicleUseCase {
  findById(id: string): Promise<Vehicle | null>;
}
