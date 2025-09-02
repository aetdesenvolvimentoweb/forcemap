import { ListAllMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListAllMilitaryRankService } from "../../services";

export const makeListAllMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listAllMilitaryRankService = makeListAllMilitaryRankService();

  return new ListAllMilitaryRankController({
    listAllMilitaryRankService,
    logger,
  });
};
