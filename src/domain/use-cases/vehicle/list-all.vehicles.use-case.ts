import { Vehicle } from "../../entities";

export interface ListAllVehiclesUseCase {
  listAll(): Promise<Vehicle[]>;
}
