import { UpdateMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateMilitaryRankService } from "../../services";

export const makeUpdateMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateMilitaryRankService = makeUpdateMilitaryRankService();

  return new UpdateMilitaryRankController({
    updateMilitaryRankService,
    logger,
  });
};
