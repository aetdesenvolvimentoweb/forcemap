import { LoggerProtocol } from "../../../../application/protocols";
import { FindByIdMilitaryRankService } from "../../../../application/services";
import { FindByIdMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import { makeIdValidator } from "../../validators";

export const makeFindByIdMilitaryRankUseCase = (
  logger: LoggerProtocol,
): FindByIdMilitaryRankUseCase => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const sanitizer = makeIdSanitizer(logger);
  const validator = makeIdValidator(logger, militaryRankRepository);

  return new FindByIdMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });
};
