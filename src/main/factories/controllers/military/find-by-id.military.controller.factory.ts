import { FindByIdMilitaryRankController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeFindByIdMilitaryRankService } from "../../services";

export const makeFindByIdMilitaryRankController = (): ControllerProtocol => {
  const logger = makeLogger();
  const findByIdMilitaryRankService = makeFindByIdMilitaryRankService();

  return new FindByIdMilitaryRankController({
    findByIdMilitaryRankService,
    logger,
  });
};
