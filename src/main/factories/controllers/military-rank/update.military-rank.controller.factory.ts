import { UpdateMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateMilitaryRankUseCase } from "../../use-cases";

export const makeUpdateMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateMilitaryRankService = makeUpdateMilitaryRankUseCase(logger);

  return new UpdateMilitaryRankController({
    updateMilitaryRankService,
    logger,
  });
};
