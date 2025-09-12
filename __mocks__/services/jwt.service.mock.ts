import { TokenHandlerProtocol } from "../../src/application/protocols";

export const mockJwtService = (): jest.Mocked<TokenHandlerProtocol> => ({
  extractTokenFromHeader: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
});
