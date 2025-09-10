import { RefreshTokenController } from "../../../../presentation/controllers/auth/refresh-token.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeAuthService } from "../../services/auth";

export const makeRefreshTokenController = (): ControllerProtocol => {
  const logger = makeLogger();
  const authService = makeAuthService();

  return new RefreshTokenController({
    authService,
    logger,
  });
};
