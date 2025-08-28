import { LoggerProtocol } from "../../../../application/protocols";
import { UpdateMilitaryRankService } from "../../../../application/services";
import { UpdateMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";
import {
  makeIdSanitizer,
  makeMilitaryRankInputDTOSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankInputDTOValidator,
} from "../../validators";

export const makeUpdateMilitaryRankUseCase = (
  logger: LoggerProtocol,
): UpdateMilitaryRankUseCase => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const idSanitizer = makeIdSanitizer(logger);
  const dataSanitizer = makeMilitaryRankInputDTOSanitizer(logger);
  const idValidator = makeIdValidator(logger, militaryRankRepository);
  const dataValidator = makeMilitaryRankInputDTOValidator(
    logger,
    militaryRankRepository,
  );

  return new UpdateMilitaryRankService({
    militaryRankRepository,
    logger,
    idSanitizer,
    dataSanitizer,
    idValidator,
    dataValidator,
  });
};
