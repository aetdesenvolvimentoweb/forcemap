import { LoggerProtocol } from "../../../../application/protocols";
import { ListByIdMilitaryRankService } from "../../../../application/services";
import { ListByIdMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import { makeIdValidator } from "../../validators";

export const makeListByIdMilitaryRankUseCase = (
  logger: LoggerProtocol,
): ListByIdMilitaryRankUseCase => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const sanitizer = makeIdSanitizer(logger);
  const validator = makeIdValidator(logger, militaryRankRepository);

  return new ListByIdMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });
};
