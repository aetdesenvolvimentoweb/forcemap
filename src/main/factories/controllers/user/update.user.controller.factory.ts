import { UpdateUserController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateUserService } from "../../services";

export const makeUpdateUserController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateUserService = makeUpdateUserService();

  return new UpdateUserController({
    updateUserService,
    logger,
  });
};
