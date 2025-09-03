import { VehicleRepository } from "../../../domain/repositories";
import { DeleteVehicleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  VehicleIdRegisteredValidatorProtocol,
} from "../../protocols";

interface DeleteVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: VehicleIdRegisteredValidatorProtocol;
}

export class DeleteVehicleService implements DeleteVehicleUseCase {
  private readonly props: DeleteVehicleServiceProps;

  constructor(props: DeleteVehicleServiceProps) {
    this.props = props;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const { vehicleRepository, sanitizer, idValidator, idRegisteredValidator } =
      this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    await idRegisteredValidator.validate(sanitizedId);
    await vehicleRepository.delete(sanitizedId);
  };
}
