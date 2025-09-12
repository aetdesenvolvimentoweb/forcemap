import { AuthService } from "../../src/application/services/auth/auth.service";

export const mockAuthService = (): jest.Mocked<
  Pick<
    AuthService,
    "refreshToken" | "logout" | "logoutAllSessions" | "validateSession"
  >
> => ({
  refreshToken: jest.fn(),
  logout: jest.fn(),
  logoutAllSessions: jest.fn(),
  validateSession: jest.fn(),
});
