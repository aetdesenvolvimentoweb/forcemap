import { SessionService } from "../../../../application/services/auth";
import { makeSessionRepository } from "../../repositories";

export const makeSessionService = (): SessionService => {
  const sessionRepository = makeSessionRepository();

  return new SessionService({
    sessionRepository,
  });
};
