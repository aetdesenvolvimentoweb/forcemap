import { VehicleRepository } from "../../../domain/repositories";
import { EntityNotFoundError } from "../../errors";
import { VehicleIdRegisteredValidatorProtocol } from "../../protocols";

interface VehicleIdRegisteredValidatorProps {
  vehicleRepository: VehicleRepository;
}

export class VehicleIdRegisteredValidator
  implements VehicleIdRegisteredValidatorProtocol
{
  constructor(private readonly props: VehicleIdRegisteredValidatorProps) {}

  validate = async (id: string): Promise<void> => {
    const { vehicleRepository } = this.props;
    const vehicle = await vehicleRepository.findById(id);

    if (!vehicle) {
      throw new EntityNotFoundError("Viatura");
    }
  };
}
