import { ListAllMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListAllMilitaryRankUseCase } from "../../use-cases";

export const makeListAllMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listAllMilitaryRankService = makeListAllMilitaryRankUseCase();

  return new ListAllMilitaryRankController({
    listAllMilitaryRankService,
    logger,
  });
};
