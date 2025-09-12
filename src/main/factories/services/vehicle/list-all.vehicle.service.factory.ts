import { ListAllVehicleService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import { makeVehicleRepository } from "../../repositories";

export const makeListAllVehicleService = (): ListAllVehicleService => {
  return GenericServiceFactory.listAllService({
    ServiceClass: ListAllVehicleService,
    repositoryMaker: makeVehicleRepository,
    repositoryKey: "vehicleRepository",
  });
};
