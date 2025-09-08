import { UpdateUserRoleController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateUserRoleService } from "../../services";

export const makeUpdateUserRoleController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateUserRoleService = makeUpdateUserRoleService();

  return new UpdateUserRoleController({
    updateUserRoleService,
    logger,
  });
};
