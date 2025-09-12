import { TokenValidator } from "../../../../application/validators";
import { makeLogger } from "../../logger";
import { makeSessionRepository } from "../../repositories";
import { makeTokenHandler } from "../../token-handler";

export const makeTokenValidator = (): TokenValidator => {
  const tokenHandler = makeTokenHandler();
  const sessionRepository = makeSessionRepository();
  const logger = makeLogger();

  return new TokenValidator({
    tokenHandler,
    sessionRepository,
    logger,
  });
};
