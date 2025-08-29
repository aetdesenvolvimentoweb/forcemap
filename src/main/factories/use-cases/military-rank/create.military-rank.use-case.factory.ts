import { LoggerProtocol } from "../../../../application/protocols";
import { CreateMilitaryRankService } from "../../../../application/services";
import { CreateMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeMilitaryRankInputDTOSanitizer } from "../../sanitizers";
import { makeMilitaryRankInputDTOValidator } from "../../validators";

export const makeCreateMilitaryRankUseCase = (
  logger: LoggerProtocol,
): CreateMilitaryRankUseCase => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const sanitizer = makeMilitaryRankInputDTOSanitizer(logger);
  const validator = makeMilitaryRankInputDTOValidator(
    logger,
    militaryRankRepository,
  );

  return new CreateMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });
};
