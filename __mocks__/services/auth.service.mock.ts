import { AuthService } from "../../src/application/services/auth/auth.service";

export const mockAuthService = (): jest.Mocked<
  Pick<AuthService, "validateSession">
> => ({
  validateSession: jest.fn(),
});
