import { FindByIdMilitaryController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeFindByIdMilitaryService } from "../../services";

export const makeFindByIdMilitaryController = (): ControllerProtocol => {
  const logger = makeLogger();
  const findByIdMilitaryService = makeFindByIdMilitaryService();

  return new FindByIdMilitaryController({
    findByIdMilitaryService,
    logger,
  });
};
