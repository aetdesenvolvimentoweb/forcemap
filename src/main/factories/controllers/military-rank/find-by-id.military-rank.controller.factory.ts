import { FindByIdMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeFindByIdMilitaryRankUseCase } from "../../use-cases";

export const makeFindByIdMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const findByIdMilitaryRankService = makeFindByIdMilitaryRankUseCase(logger);

  return new FindByIdMilitaryRankController({
    findByIdMilitaryRankService,
    logger,
  });
};
