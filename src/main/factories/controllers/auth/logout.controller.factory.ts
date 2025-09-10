import { LogoutController } from "../../../../presentation/controllers/auth/logout.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeAuthService } from "../../services/auth";

export const makeLogoutController = (): ControllerProtocol => {
  const logger = makeLogger();
  const authService = makeAuthService();

  return new LogoutController({
    authService,
    logger,
  });
};
