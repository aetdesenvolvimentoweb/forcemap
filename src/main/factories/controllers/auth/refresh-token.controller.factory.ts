import { RefreshTokenController } from "../../../../presentation/controllers/auth/refresh-token.controller";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeRefreshTokenService } from "../../services/auth";

export const makeRefreshTokenController = (): ControllerProtocol => {
  const logger = makeLogger();
  const refreshTokenService = makeRefreshTokenService();

  return new RefreshTokenController({
    refreshTokenService,
    logger,
  });
};
