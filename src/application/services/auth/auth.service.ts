import { SessionService } from "./session.service";

interface AuthServiceDependencies {
  sessionService: SessionService;
}

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  public readonly validateSession = async (
    sessionId: string,
  ): Promise<boolean> => {
    return this.dependencies.sessionService.validateSession(sessionId);
  };
}
