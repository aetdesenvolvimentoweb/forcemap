import { ListByIdMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListByIdMilitaryRankUseCase } from "../../use-cases";

export const makeListByIdMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listByIdMilitaryRankService = makeListByIdMilitaryRankUseCase(logger);

  return new ListByIdMilitaryRankController({
    listByIdMilitaryRankService,
    logger,
  });
};
