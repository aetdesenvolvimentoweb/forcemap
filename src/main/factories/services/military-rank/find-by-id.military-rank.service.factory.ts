import { FindByIdMilitaryRankService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdMilitaryRankService =
  (): FindByIdMilitaryRankService => {
    return GenericServiceFactory.findByIdService({
      ServiceClass: FindByIdMilitaryRankService,
      repositoryMaker: makeMilitaryRankRepository,
      idSanitizerMaker: makeIdSanitizer,
      idValidatorMaker: makeIdValidator,
      idRegisteredValidatorMaker: makeMilitaryRankIdRegisteredValidator,
      repositoryKey: "militaryRankRepository",
    });
  };
