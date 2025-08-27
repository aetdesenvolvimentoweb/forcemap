import { LoggerProtocol } from "../../../../application/protocols";
import { DeleteMilitaryRankService } from "../../../../application/services";
import { DeleteMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import { makeIdValidator } from "../../validators";

export const makeDeleteMilitaryRankUseCase = (
  logger: LoggerProtocol,
): DeleteMilitaryRankUseCase => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const sanitizer = makeIdSanitizer(logger);
  const validator = makeIdValidator(logger, militaryRankRepository);

  return new DeleteMilitaryRankService({
    militaryRankRepository,
    logger,
    sanitizer,
    validator,
  });
};
