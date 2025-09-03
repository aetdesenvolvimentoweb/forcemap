import { ListAllVehicleService } from "../../../../application/services";
import { makeVehicleRepository } from "../../repositories";

export const makeListAllVehicleService = (): ListAllVehicleService => {
  const vehicleRepository = makeVehicleRepository();

  return new ListAllVehicleService({
    vehicleRepository,
  });
};
