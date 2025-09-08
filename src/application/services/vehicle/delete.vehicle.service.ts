import { VehicleRepository } from "../../../domain/repositories";
import { DeleteVehicleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  VehicleIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseDeleteService, BaseDeleteServiceDeps } from "../common";

interface DeleteVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: VehicleIdRegisteredValidatorProtocol;
}

export class DeleteVehicleService
  extends BaseDeleteService
  implements DeleteVehicleUseCase
{
  constructor(props: DeleteVehicleServiceProps) {
    const baseServiceDeps: BaseDeleteServiceDeps = {
      repository: props.vehicleRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
