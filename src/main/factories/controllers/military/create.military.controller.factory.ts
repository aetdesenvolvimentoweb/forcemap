import { CreateMilitaryController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeCreateMilitaryService } from "../../services";

export const makeCreateMilitaryController = (): ControllerProtocol => {
  const logger = makeLogger();
  const createMilitaryService = makeCreateMilitaryService();

  return new CreateMilitaryController({
    createMilitaryService,
    logger,
  });
};
