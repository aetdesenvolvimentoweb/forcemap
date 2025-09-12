import { AuthService } from "../../src/application/services/auth/auth.service";

export const mockAuthService = (): jest.Mocked<
  Pick<AuthService, "refreshToken" | "validateSession">
> => ({
  refreshToken: jest.fn(),
  validateSession: jest.fn(),
});
