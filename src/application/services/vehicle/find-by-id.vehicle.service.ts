import { Vehicle } from "../../../domain/entities";
import { VehicleRepository } from "../../../domain/repositories";
import { FindByIdVehicleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  VehicleIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseFindByIdService, BaseFindByIdServiceDeps } from "../common";

interface FindByIdVehicleServiceProps {
  vehicleRepository: VehicleRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: VehicleIdRegisteredValidatorProtocol;
}

export class FindByIdVehicleService
  extends BaseFindByIdService<Vehicle>
  implements FindByIdVehicleUseCase
{
  constructor(props: FindByIdVehicleServiceProps) {
    const baseServiceDeps: BaseFindByIdServiceDeps<Vehicle> = {
      repository: props.vehicleRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
