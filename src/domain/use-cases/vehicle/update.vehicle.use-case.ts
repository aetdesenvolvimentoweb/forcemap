import { VehicleInputDTO } from "../../dtos";

export interface UpdateVehicleUseCase {
  update(id: string, data: VehicleInputDTO): Promise<void>;
}
