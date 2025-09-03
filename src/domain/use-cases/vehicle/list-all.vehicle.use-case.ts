import { Vehicle } from "../../entities";

export interface ListAllVehicleUseCase {
  listAll(): Promise<Vehicle[]>;
}
