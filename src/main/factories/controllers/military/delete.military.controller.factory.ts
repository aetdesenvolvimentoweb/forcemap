import { DeleteMilitaryController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeDeleteMilitaryService } from "../../services";

export const makeDeleteMilitaryController = (): ControllerProtocol => {
  const logger = makeLogger();
  const deleteMilitaryService = makeDeleteMilitaryService();

  return new DeleteMilitaryController({
    deleteMilitaryService,
    logger,
  });
};
