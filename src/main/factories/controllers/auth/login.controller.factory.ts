import { LoginController } from "../../../../presentation/controllers/auth/login.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeLoginService } from "../../services/auth";

export const makeLoginController = (): ControllerProtocol => {
  const logger = makeLogger();
  const loginService = makeLoginService();

  return new LoginController({
    loginService,
    logger,
  });
};
