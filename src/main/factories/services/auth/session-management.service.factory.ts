import { SessionManagementService } from "../../../../application/services/auth/session-management.service";
import { makeSessionRepository } from "../../repositories";
import { makeTokenHandler } from "../../token-handler";

export const makeSessionManagementService = (): SessionManagementService => {
  const sessionRepository = makeSessionRepository();
  const tokenHandler = makeTokenHandler();

  return new SessionManagementService({
    sessionRepository,
    tokenHandler,
  });
};
