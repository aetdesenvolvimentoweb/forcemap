import { LoggerProtocol } from "../../../../application/protocols";
import { ListAllMilitaryRankService } from "../../../../application/services";
import { ListAllMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";

export const makeListAllMilitaryRankUseCase = (
  logger: LoggerProtocol,
): ListAllMilitaryRankUseCase => {
  const militaryRankRepository = makeMilitaryRankRepository();

  return new ListAllMilitaryRankService({
    militaryRankRepository,
    logger,
  });
};
