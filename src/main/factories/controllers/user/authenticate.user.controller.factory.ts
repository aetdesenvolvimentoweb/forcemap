import { AuthenticateUserController } from "../../../../presentation/controllers/user/authenticate.user.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeAuthenticateUserService } from "../../services/user/authenticate.user.service.factory";

export const makeAuthenticateUserController = (): ControllerProtocol => {
  const logger = makeLogger();
  const authenticateUserService = makeAuthenticateUserService();

  return new AuthenticateUserController({
    authenticateUserService,
    logger,
  });
};
