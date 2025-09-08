import { Vehicle } from "../../../domain/entities";
import { VehicleRepository } from "../../../domain/repositories";
import { ListAllVehicleUseCase } from "../../../domain/use-cases";
import { BaseListAllService, BaseListAllServiceDeps } from "../common";

interface ListAllVehicleServiceProps {
  vehicleRepository: VehicleRepository;
}

export class ListAllVehicleService
  extends BaseListAllService<Vehicle>
  implements ListAllVehicleUseCase
{
  constructor(props: ListAllVehicleServiceProps) {
    const baseServiceDeps: BaseListAllServiceDeps<Vehicle> = {
      repository: props.vehicleRepository,
    };
    super(baseServiceDeps);
  }
}
