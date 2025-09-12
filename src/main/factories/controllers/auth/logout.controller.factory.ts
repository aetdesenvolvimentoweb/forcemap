import { LogoutController } from "../../../../presentation/controllers/auth/logout.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeLogoutService } from "../../services/auth";

export const makeLogoutController = (): ControllerProtocol => {
  const logger = makeLogger();
  const logoutService = makeLogoutService();

  return new LogoutController({
    logoutService,
    logger,
  });
};
