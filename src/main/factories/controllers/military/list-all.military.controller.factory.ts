import { ListAllMilitaryController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeListAllMilitaryService } from "../../services";

export const makeListAllMilitaryController = (): ControllerProtocol => {
  const logger = makeLogger();
  const listAllMilitaryService = makeListAllMilitaryService();

  return new ListAllMilitaryController({
    listAllMilitaryService,
    logger,
  });
};
