import { VehicleInputDTO } from "../../dtos";

export interface CreateVehicleUseCase {
  create(data: VehicleInputDTO): Promise<void>;
}
