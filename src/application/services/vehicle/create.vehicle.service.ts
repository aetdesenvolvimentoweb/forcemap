import { VehicleInputDTO } from "../../../domain/dtos";
import { VehicleRepository } from "../../../domain/repositories";
import { CreateVehicleUseCase } from "../../../domain/use-cases";
import {
  VehicleInputDTOSanitizerProtocol,
  VehicleInputDTOValidatorProtocol,
} from "../../protocols";
import { BaseCreateService, BaseCreateServiceDeps } from "../common";

interface CreateVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  sanitizer: VehicleInputDTOSanitizerProtocol;
  validator: VehicleInputDTOValidatorProtocol;
}

export class CreateVehicleService
  extends BaseCreateService<VehicleInputDTO>
  implements CreateVehicleUseCase
{
  constructor(props: CreateVehicleServiceProps) {
    const baseServiceDeps: BaseCreateServiceDeps<
      VehicleInputDTOSanitizerProtocol,
      VehicleInputDTOValidatorProtocol,
      VehicleRepository
    > = {
      repository: props.vehicleRepository,
      sanitizer: props.sanitizer,
      validator: props.validator,
    };
    super(baseServiceDeps);
  }
}
