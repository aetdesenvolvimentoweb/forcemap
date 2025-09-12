import { LoginService } from "../../src/application/services/auth/login.service";

export const mockLoginService = (): jest.Mocked<
  Pick<
    LoginService,
    "authenticate" | "refreshToken" | "logout" | "logoutAllSessions"
  >
> => ({
  authenticate: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  logoutAllSessions: jest.fn(),
});
