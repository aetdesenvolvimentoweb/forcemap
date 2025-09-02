import { DeleteMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeDeleteMilitaryRankService } from "../../services";

export const makeDeleteMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const deleteMilitaryRankService = makeDeleteMilitaryRankService();

  return new DeleteMilitaryRankController({
    deleteMilitaryRankService,
    logger,
  });
};
