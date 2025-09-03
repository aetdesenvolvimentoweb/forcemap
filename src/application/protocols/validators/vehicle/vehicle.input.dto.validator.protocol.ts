import { VehicleInputDTO } from "../../../../domain/dtos";

export interface VehicleInputDTOValidatorProtocol {
  validate(data: VehicleInputDTO, idToIgnore?: string): Promise<void>;
}
