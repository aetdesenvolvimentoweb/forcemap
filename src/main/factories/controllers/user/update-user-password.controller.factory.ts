import { UpdateUserPasswordController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeUpdateUserPasswordService } from "../../services";

export const makeUpdateUserPasswordController = (): ControllerProtocol => {
  const logger = makeLogger();
  const updateUserPasswordService = makeUpdateUserPasswordService();

  return new UpdateUserPasswordController({
    updateUserPasswordService,
    logger,
  });
};
