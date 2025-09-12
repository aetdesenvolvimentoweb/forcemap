import { RefreshTokenService } from "../../src/application/services/auth/refresh-token.service";

export const mockRefreshTokenService = (): jest.Mocked<
  Pick<RefreshTokenService, "refreshToken">
> => ({
  refreshToken: jest.fn(),
});
