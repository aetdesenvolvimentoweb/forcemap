import { Request } from "express";

import { SessionRepository } from "../../../domain/repositories";
import { authSecurityLogger } from "../../../infra/adapters/middlewares";

interface LogoutServiceDependencies {
  sessionRepository: SessionRepository;
}

export class LogoutService {
  constructor(private readonly dependencies: LogoutServiceDependencies) {}

  public readonly logout = async (
    sessionId: string,
    userId?: string,
    request?: Request,
  ): Promise<void> => {
    try {
      await this.dependencies.sessionRepository.deactivateSession(sessionId);

      // Log successful logout
      if (userId) {
        authSecurityLogger.logLogout(userId, request);
      }
    } catch {
      // Silent fail for logout - even if session doesn't exist, logout is successful
    }
  };
}
