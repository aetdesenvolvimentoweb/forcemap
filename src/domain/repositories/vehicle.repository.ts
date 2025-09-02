import { VehicleInputDTO } from "../dtos";
import { Vehicle } from "../entities";

export interface VehicleRepository {
  create(data: VehicleInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<Vehicle | null>;
  findById(id: string): Promise<Vehicle | null>;
  findByOrder(order: number): Promise<Vehicle | null>;
  listAll(): Promise<Vehicle[]>;
  update(id: string, data: VehicleInputDTO): Promise<void>;
}
