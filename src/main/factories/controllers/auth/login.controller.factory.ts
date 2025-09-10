import { LoginController } from "../../../../presentation/controllers/auth/login.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeAuthService } from "../../services/auth";

export const makeLoginController = (): ControllerProtocol => {
  const logger = makeLogger();
  const authService = makeAuthService();

  return new LoginController({
    authService,
    logger,
  });
};
