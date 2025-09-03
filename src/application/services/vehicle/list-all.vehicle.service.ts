import { Vehicle } from "../../../domain/entities";
import { VehicleRepository } from "../../../domain/repositories";
import { ListAllVehicleUseCase } from "../../../domain/use-cases";

interface ListAllVehicleServiceProps {
  vehicleRepository: VehicleRepository;
}

export class ListAllVehicleService implements ListAllVehicleUseCase {
  private readonly props: ListAllVehicleServiceProps;

  constructor(props: ListAllVehicleServiceProps) {
    this.props = props;
  }

  public readonly listAll = async (): Promise<Vehicle[]> => {
    const { vehicleRepository } = this.props;
    return await vehicleRepository.listAll();
  };
}
