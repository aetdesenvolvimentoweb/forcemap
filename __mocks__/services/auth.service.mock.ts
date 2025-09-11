import { AuthService } from "../../src/application/services/auth/auth.service";

export const mockAuthService = (): jest.Mocked<
  Pick<
    AuthService,
    | "login"
    | "refreshToken"
    | "logout"
    | "logoutAllSessions"
    | "validateSession"
  >
> => ({
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  logoutAllSessions: jest.fn(),
  validateSession: jest.fn(),
});
