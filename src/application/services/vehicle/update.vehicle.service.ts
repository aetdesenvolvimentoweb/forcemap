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
import { BaseUpdateService, BaseUpdateServiceDeps } from "../common";

interface UpdateVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: VehicleInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: VehicleIdRegisteredValidatorProtocol;
  dataValidator: VehicleInputDTOValidatorProtocol;
}

export class UpdateVehicleService
  extends BaseUpdateService<VehicleInputDTO>
  implements UpdateVehicleUseCase
{
  constructor(props: UpdateVehicleServiceProps) {
    const baseServiceDeps: BaseUpdateServiceDeps<VehicleInputDTO> = {
      repository: props.vehicleRepository,
      idSanitizer: props.idSanitizer,
      dataSanitizer: props.dataSanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
      dataValidator: props.dataValidator,
    };
    super(baseServiceDeps);
  }
}
