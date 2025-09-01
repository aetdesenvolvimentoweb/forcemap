import { CreateMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeCreateMilitaryRankService } from "../../services";

export const makeCreateMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const createMilitaryRankService = makeCreateMilitaryRankService();

  return new CreateMilitaryRankController({
    createMilitaryRankService,
    logger,
  });
};
