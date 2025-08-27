import { DeleteMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeDeleteMilitaryRankUseCase } from "../../use-cases";

export const makeDeleteMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const deleteMilitaryRankService = makeDeleteMilitaryRankUseCase(logger);

  return new DeleteMilitaryRankController({
    deleteMilitaryRankService,
    logger,
  });
};
