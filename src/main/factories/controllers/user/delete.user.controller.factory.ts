import { DeleteUserController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeDeleteUserService } from "../../services";

export const makeDeleteUserController = (): ControllerProtocol => {
  const logger = makeLogger();
  const deleteUserService = makeDeleteUserService();

  return new DeleteUserController({
    deleteUserService,
    logger,
  });
};
