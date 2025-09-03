import { VehicleInputDTO } from "../../../domain/dtos";
import { VehicleRepository } from "../../../domain/repositories";
import { CreateVehicleUseCase } from "../../../domain/use-cases";
import {
  VehicleInputDTOSanitizerProtocol,
  VehicleInputDTOValidatorProtocol,
} from "../../protocols";

interface CreateVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  sanitizer: VehicleInputDTOSanitizerProtocol;
  validator: VehicleInputDTOValidatorProtocol;
}

export class CreateVehicleService implements CreateVehicleUseCase {
  private readonly props: CreateVehicleServiceProps;

  constructor(props: CreateVehicleServiceProps) {
    this.props = props;
  }

  public readonly create = async (data: VehicleInputDTO): Promise<void> => {
    const { vehicleRepository, sanitizer, validator } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await validator.validate(sanitizedData);
    await vehicleRepository.create(sanitizedData);
  };
}
