import { VehicleInputDTO } from "../../../domain/dtos";
import { VehicleRepository } from "../../../domain/repositories";
import { UpdateVehicleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  VehicleIdRegisteredValidatorProtocol,
  VehicleInputDTOSanitizerProtocol,
  VehicleInputDTOValidatorProtocol,
} from "../../protocols";

interface UpdateVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: VehicleInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: VehicleIdRegisteredValidatorProtocol;
  dataValidator: VehicleInputDTOValidatorProtocol;
}

export class UpdateVehicleService implements UpdateVehicleUseCase {
  private readonly props: UpdateVehicleServiceProps;

  constructor(props: UpdateVehicleServiceProps) {
    this.props = props;
  }

  public readonly update = async (
    id: string,
    data: VehicleInputDTO,
  ): Promise<void> => {
    const {
      vehicleRepository,
      idSanitizer,
      dataSanitizer,
      idValidator,
      idRegisteredValidator,
      dataValidator,
    } = this.props;

    const sanitizedId = idSanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    idRegisteredValidator.validate(sanitizedId);
    const sanitizedData = dataSanitizer.sanitize(data);
    await dataValidator.validate(sanitizedData, sanitizedId);
    await vehicleRepository.update(sanitizedId, sanitizedData);
  };
}
