import { Vehicle } from "../../../domain/entities";
import { VehicleRepository } from "../../../domain/repositories";
import { FindByIdVehicleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  VehicleIdRegisteredValidatorProtocol,
} from "../../protocols";

interface FindByIdVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: VehicleIdRegisteredValidatorProtocol;
}

export class FindByIdVehicleService implements FindByIdVehicleUseCase {
  private readonly props: FindByIdVehicleServiceProps;

  constructor(props: FindByIdVehicleServiceProps) {
    this.props = props;
  }

  public readonly findById = async (id: string): Promise<Vehicle | null> => {
    const { vehicleRepository, sanitizer, idValidator, idRegisteredValidator } =
      this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    await idRegisteredValidator.validate(sanitizedId);
    const vehicle = await vehicleRepository.findById(sanitizedId);
    return vehicle;
  };
}
