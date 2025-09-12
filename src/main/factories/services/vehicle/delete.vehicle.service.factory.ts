import { DeleteVehicleService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import { makeVehicleRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeVehicleIdRegisteredValidator,
} from "../../validators";

export const makeDeleteVehicleService = (): DeleteVehicleService => {
  return GenericServiceFactory.deleteService({
    ServiceClass: DeleteVehicleService,
    repositoryMaker: makeVehicleRepository,
    idSanitizerMaker: makeIdSanitizer,
    idValidatorMaker: makeIdValidator,
    idRegisteredValidatorMaker: makeVehicleIdRegisteredValidator,
    repositoryKey: "vehicleRepository",
  });
};
