import { LogoutService } from "../../src/application/services/auth/logout.service";

export const mockLogoutService = (): jest.Mocked<
  Pick<LogoutService, "logout">
> => ({
  logout: jest.fn(),
});
