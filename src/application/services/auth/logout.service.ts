import { SessionService } from "./session.service";

interface LogoutServiceDependencies {
  sessionService: SessionService;
}

export class LogoutService {
  constructor(private readonly dependencies: LogoutServiceDependencies) {}

  public readonly logout = async (sessionId: string): Promise<void> => {
    try {
      await this.dependencies.sessionService.deactivateSession(sessionId);
    } catch {
      // Silent fail for logout - even if session doesn't exist, logout is successful
    }
  };
}
