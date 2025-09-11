import { JWTProtocol } from "../../src/application/protocols/jwt.protocol";

export const mockJwtService = (): jest.Mocked<JWTProtocol> => ({
  extractTokenFromHeader: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
});
