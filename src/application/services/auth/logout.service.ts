import { SessionRepository } from "../../../domain/repositories";

interface LogoutServiceDependencies {
  sessionRepository: SessionRepository;
}

export class LogoutService {
  constructor(private readonly dependencies: LogoutServiceDependencies) {}

  public readonly logout = async (sessionId: string): Promise<void> => {
    try {
      await this.dependencies.sessionRepository.deactivateSession(sessionId);
    } catch {
      // Silent fail for logout - even if session doesn't exist, logout is successful
    }
  };
}
