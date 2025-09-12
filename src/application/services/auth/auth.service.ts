import {
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../domain/dtos/auth";
import { LoginService } from "./login.service";
import { SessionService } from "./session.service";

interface AuthServiceDependencies {
  loginService: LoginService;
  sessionService: SessionService;
}

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  public readonly refreshToken = async (
    data: RefreshTokenInputDTO,
    ipAddress: string,
  ): Promise<LoginOutputDTO> => {
    return this.dependencies.loginService.refreshToken(data, ipAddress);
  };

  public readonly logout = async (sessionId: string): Promise<void> => {
    return this.dependencies.loginService.logout(sessionId);
  };

  public readonly logoutAllSessions = async (userId: string): Promise<void> => {
    return this.dependencies.loginService.logoutAllSessions(userId);
  };

  public readonly validateSession = async (
    sessionId: string,
  ): Promise<boolean> => {
    return this.dependencies.sessionService.validateSession(sessionId);
  };
}
