import { CreateMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeCreateMilitaryRankUseCase } from "../../use-cases";

export const makeCreateMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const createMilitaryRankService = makeCreateMilitaryRankUseCase(logger);

  return new CreateMilitaryRankController({
    createMilitaryRankService,
    logger,
  });
};
