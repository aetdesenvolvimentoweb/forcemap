import { SessionRepository } from "../../../domain/repositories";
import { SecurityLoggerProtocol } from "../../protocols";

interface LogoutServiceDependencies {
  sessionRepository: SessionRepository;
  securityLogger: SecurityLoggerProtocol;
}

export class LogoutService {
  constructor(private readonly dependencies: LogoutServiceDependencies) {}

  public readonly logout = async (
    sessionId: string,
    userId?: string,
  ): Promise<void> => {
    try {
      await this.dependencies.sessionRepository.deactivateSession(sessionId);

      // Log successful logout
      if (userId) {
        this.dependencies.securityLogger.logLogout(userId);
      }
    } catch {
      // Silent fail for logout - even if session doesn't exist, logout is successful
    }
  };
}
