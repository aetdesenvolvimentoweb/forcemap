import { LoginService } from "../../src/application/services/auth/login.service";

export const mockLoginService = (): jest.Mocked<
  Pick<LoginService, "authenticate" | "refreshToken">
> => ({
  authenticate: jest.fn(),
  refreshToken: jest.fn(),
});
