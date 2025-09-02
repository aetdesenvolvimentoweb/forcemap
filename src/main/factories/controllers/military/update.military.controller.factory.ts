import { UpdateMilitaryController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateMilitaryService } from "../../services";

export const makeUpdateMilitaryController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateMilitaryService = makeUpdateMilitaryService();

  return new UpdateMilitaryController({
    updateMilitaryService,
    logger,
  });
};
