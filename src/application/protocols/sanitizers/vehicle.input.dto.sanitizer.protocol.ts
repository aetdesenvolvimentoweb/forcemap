import { VehicleInputDTO } from "../../../domain/dtos";

export interface VehicleInputDTOSanitizerProtocol {
  sanitize(data: VehicleInputDTO): VehicleInputDTO;
}
