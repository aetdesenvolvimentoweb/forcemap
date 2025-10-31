import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";

import {
  InvalidParamError,
  UnauthorizedError,
} from "../../../../src/application/errors";
import { JsonWebTokenHandlerAdapter } from "../../../../src/infra/adapters";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  JsonWebTokenError: jest.requireActual("jsonwebtoken").JsonWebTokenError,
  TokenExpiredError: jest.requireActual("jsonwebtoken").TokenExpiredError,
}));

const mockSign = sign as jest.Mock;
const mockVerify = verify as jest.Mock;

describe("JsonWebTokenJWTAdapter", () => {
  let sut: JsonWebTokenHandlerAdapter;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.NODE_ENV = "test";
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    process.env.JWT_ACCESS_EXPIRY = "15m";
    process.env.JWT_REFRESH_EXPIRY = "7d";

    // Apenas cria o adapter se não estiver em um teste específico de configuração
    if (process.env.NODE_ENV === "test") {
      sut = new JsonWebTokenHandlerAdapter();
    }
  });

  describe("constructor", () => {
    it("should use environment variables when provided", () => {
      process.env.JWT_ACCESS_SECRET = "custom-access-secret";
      process.env.JWT_REFRESH_SECRET = "custom-refresh-secret";
      process.env.JWT_ACCESS_EXPIRY = "30m";
      process.env.JWT_REFRESH_EXPIRY = "14d";

      const adapter = new JsonWebTokenHandlerAdapter();

      expect(adapter["accessTokenSecret"]).toBe("custom-access-secret");
      expect(adapter["refreshTokenSecret"]).toBe("custom-refresh-secret");
      expect(adapter["accessTokenExpiry"]).toBe("30m");
      expect(adapter["refreshTokenExpiry"]).toBe("14d");
    });

    it("should throw ConfigurationError when JWT secrets are not provided", () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      expect(() => new JsonWebTokenHandlerAdapter()).toThrow(
        "Erro de configuração: JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser configurados via variáveis de ambiente",
      );
    });
  });

  describe("generateAccessToken", () => {
    const validPayload = {
      userId: "user-123",
      sessionId: "session-123",
      role: "ADMIN",
      militaryId: "military-123",
    };

    it("should generate access token successfully", () => {
      const expectedToken = "generated-access-token";
      mockSign.mockReturnValue(expectedToken);

      const result = sut.generateAccessToken(validPayload);

      expect(result).toBe(expectedToken);
      expect(mockSign).toHaveBeenCalledWith(
        validPayload,
        "test-access-secret",
        {
          expiresIn: "15m",
          issuer: "forcemap-api",
          audience: "forcemap-client",
        },
      );
    });

    it("should throw InvalidParamError when sign throws error", () => {
      mockSign.mockImplementation(() => {
        throw new Error("Sign error");
      });

      expect(() => sut.generateAccessToken(validPayload)).toThrow(
        InvalidParamError,
      );
      expect(() => sut.generateAccessToken(validPayload)).toThrow(
        "O campo Payload do token é inválido: inválido para geração.",
      );
    });

    it("should handle different payload combinations", () => {
      const payloads = [
        {
          userId: "user-1",
          sessionId: "session-1",
          role: "USER",
          militaryId: "military-1",
        },
        {
          userId: "user-2",
          sessionId: "session-2",
          role: "ADMIN",
          militaryId: "military-2",
        },
      ];

      mockSign.mockReturnValue("token");

      for (const payload of payloads) {
        sut.generateAccessToken(payload);
        expect(mockSign).toHaveBeenCalledWith(
          payload,
          "test-access-secret",
          expect.any(Object),
        );
      }
    });

    it("should use correct sign options", () => {
      mockSign.mockReturnValue("token");

      sut.generateAccessToken(validPayload);

      expect(mockSign).toHaveBeenCalledWith(
        validPayload,
        "test-access-secret",
        {
          expiresIn: "15m",
          issuer: "forcemap-api",
          audience: "forcemap-client",
        },
      );
    });
  });

  describe("generateRefreshToken", () => {
    const validPayload = {
      userId: "user-123",
      sessionId: "session-123",
    };

    it("should generate refresh token successfully", () => {
      const expectedToken = "generated-refresh-token";
      mockSign.mockReturnValue(expectedToken);

      const result = sut.generateRefreshToken(validPayload);

      expect(result).toBe(expectedToken);
      expect(mockSign).toHaveBeenCalledWith(
        validPayload,
        "test-refresh-secret",
        {
          expiresIn: "7d",
          issuer: "forcemap-api",
          audience: "forcemap-client",
        },
      );
    });

    it("should throw InvalidParamError when sign throws error", () => {
      mockSign.mockImplementation(() => {
        throw new Error("Sign error");
      });

      expect(() => sut.generateRefreshToken(validPayload)).toThrow(
        InvalidParamError,
      );
      expect(() => sut.generateRefreshToken(validPayload)).toThrow(
        "O campo Payload do refresh token é inválido: inválido para geração.",
      );
    });

    it("should handle different refresh payload combinations", () => {
      const payloads = [
        { userId: "user-1", sessionId: "session-1" },
        { userId: "user-2", sessionId: "session-2" },
      ];

      mockSign.mockReturnValue("refresh-token");

      for (const payload of payloads) {
        sut.generateRefreshToken(payload);
        expect(mockSign).toHaveBeenCalledWith(
          payload,
          "test-refresh-secret",
          expect.any(Object),
        );
      }
    });
  });

  describe("verifyAccessToken", () => {
    const validToken = "valid-access-token";
    const validDecodedPayload = {
      userId: "user-123",
      sessionId: "session-123",
      role: "ADMIN",
      militaryId: "military-123",
      iat: 1234567890,
      exp: 1234567900,
    };

    it("should verify access token successfully", () => {
      mockVerify.mockReturnValue(validDecodedPayload);

      const result = sut.verifyAccessToken(validToken);

      expect(result).toEqual(validDecodedPayload);
      expect(mockVerify).toHaveBeenCalledWith(
        validToken,
        "test-access-secret",
        {
          issuer: "forcemap-api",
          audience: "forcemap-client",
        },
      );
    });

    it("should throw UnauthorizedError for empty token", () => {
      expect(() => sut.verifyAccessToken("")).toThrow(UnauthorizedError);
      expect(() => sut.verifyAccessToken("")).toThrow(
        "Token de acesso obrigatório",
      );
    });

    it("should throw UnauthorizedError for null token", () => {
      expect(() => sut.verifyAccessToken(null as any)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(null as any)).toThrow(
        "Token de acesso obrigatório",
      );
    });

    it("should throw UnauthorizedError for non-string token", () => {
      expect(() => sut.verifyAccessToken(123 as any)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(123 as any)).toThrow(
        "Token de acesso obrigatório",
      );
    });

    it("should throw UnauthorizedError when token is expired", () => {
      mockVerify.mockImplementation(() => {
        throw new TokenExpiredError("Token expired", new Date());
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Token de acesso expirado",
      );
    });

    it("should throw UnauthorizedError when token is malformed", () => {
      mockVerify.mockImplementation(() => {
        throw new JsonWebTokenError("Token malformed");
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Token de acesso inválido",
      );
    });

    it("should throw UnauthorizedError when payload is missing userId", () => {
      const invalidPayload = {
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
        iat: 1234567890,
        exp: 1234567900,
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Token de acesso inválido",
      );
    });

    it("should throw UnauthorizedError when payload is missing sessionId", () => {
      const invalidPayload = {
        userId: "user-123",
        role: "ADMIN",
        militaryId: "military-123",
        iat: 1234567890,
        exp: 1234567900,
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Token de acesso inválido",
      );
    });

    it("should throw UnauthorizedError when payload is missing role", () => {
      const invalidPayload = {
        userId: "user-123",
        sessionId: "session-123",
        militaryId: "military-123",
        iat: 1234567890,
        exp: 1234567900,
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Token de acesso inválido",
      );
    });

    it("should throw UnauthorizedError when payload is missing militaryId", () => {
      const invalidPayload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        iat: 1234567890,
        exp: 1234567900,
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Token de acesso inválido",
      );
    });

    it("should re-throw UnauthorizedError without wrapping", () => {
      const originalError = new UnauthorizedError("Original error");
      mockVerify.mockImplementation(() => {
        throw originalError;
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(originalError);
    });

    it("should throw UnauthorizedError for unknown errors", () => {
      mockVerify.mockImplementation(() => {
        throw new Error("Unknown error");
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        "Erro na validação do token de acesso",
      );
    });
  });

  describe("verifyRefreshToken", () => {
    const validToken = "valid-refresh-token";
    const validDecodedPayload = {
      userId: "user-123",
      sessionId: "session-123",
      iat: 1234567890,
      exp: 1234567900,
    };

    it("should verify refresh token successfully", () => {
      mockVerify.mockReturnValue(validDecodedPayload);

      const result = sut.verifyRefreshToken(validToken);

      expect(result).toEqual(validDecodedPayload);
      expect(mockVerify).toHaveBeenCalledWith(
        validToken,
        "test-refresh-secret",
        {
          issuer: "forcemap-api",
          audience: "forcemap-client",
        },
      );
    });

    it("should throw UnauthorizedError for empty token", () => {
      expect(() => sut.verifyRefreshToken("")).toThrow(UnauthorizedError);
      expect(() => sut.verifyRefreshToken("")).toThrow(
        "Refresh token obrigatório",
      );
    });

    it("should throw UnauthorizedError for null token", () => {
      expect(() => sut.verifyRefreshToken(null as any)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(null as any)).toThrow(
        "Refresh token obrigatório",
      );
    });

    it("should throw UnauthorizedError for non-string token", () => {
      expect(() => sut.verifyRefreshToken(123 as any)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(123 as any)).toThrow(
        "Refresh token obrigatório",
      );
    });

    it("should throw UnauthorizedError when refresh token is expired", () => {
      mockVerify.mockImplementation(() => {
        throw new TokenExpiredError("Token expired", new Date());
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        "Refresh token expirado",
      );
    });

    it("should throw UnauthorizedError when refresh token is malformed", () => {
      mockVerify.mockImplementation(() => {
        throw new JsonWebTokenError("Token malformed");
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        "Refresh token inválido",
      );
    });

    it("should throw UnauthorizedError when refresh payload is missing userId", () => {
      const invalidPayload = {
        sessionId: "session-123",
        iat: 1234567890,
        exp: 1234567900,
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        "Refresh token inválido",
      );
    });

    it("should throw UnauthorizedError when refresh payload is missing sessionId", () => {
      const invalidPayload = {
        userId: "user-123",
        iat: 1234567890,
        exp: 1234567900,
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        "Refresh token inválido",
      );
    });

    it("should re-throw UnauthorizedError without wrapping", () => {
      const originalError = new UnauthorizedError("Original refresh error");
      mockVerify.mockImplementation(() => {
        throw originalError;
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(originalError);
    });

    it("should throw UnauthorizedError for unknown errors", () => {
      mockVerify.mockImplementation(() => {
        throw new Error("Unknown refresh error");
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        UnauthorizedError,
      );
      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        "Erro na validação do refresh token",
      );
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract token from valid Bearer header", () => {
      const header = "Bearer valid-token-123";
      const result = sut.extractTokenFromHeader(header);

      expect(result).toBe("valid-token-123");
    });

    it("should return null for empty header", () => {
      const result = sut.extractTokenFromHeader("");
      expect(result).toBeNull();
    });

    it("should return null for undefined header", () => {
      const result = sut.extractTokenFromHeader(undefined);
      expect(result).toBeNull();
    });

    it("should return null for null header", () => {
      const result = sut.extractTokenFromHeader(null as any);
      expect(result).toBeNull();
    });

    it("should return null for non-string header", () => {
      const result = sut.extractTokenFromHeader(123 as any);
      expect(result).toBeNull();
    });

    it("should return null for header without Bearer prefix", () => {
      const result = sut.extractTokenFromHeader("token-without-bearer");
      expect(result).toBeNull();
    });

    it("should return null for header with wrong prefix", () => {
      const result = sut.extractTokenFromHeader("Basic token-123");
      expect(result).toBeNull();
    });

    it("should return null for header with only Bearer", () => {
      const result = sut.extractTokenFromHeader("Bearer");
      expect(result).toBeNull();
    });

    it("should return null for header with Bearer and empty token", () => {
      const result = sut.extractTokenFromHeader("Bearer ");
      expect(result).toBeNull();
    });

    it("should return null for header with Bearer and whitespace only", () => {
      const result = sut.extractTokenFromHeader("Bearer    ");
      expect(result).toBeNull();
    });

    it("should return null for header with too many parts", () => {
      const result = sut.extractTokenFromHeader("Bearer token extra-part");
      expect(result).toBeNull();
    });

    it("should handle token with proper format", () => {
      const header = "Bearer token-with-spaces";
      const result = sut.extractTokenFromHeader(header);
      expect(result).toBe("token-with-spaces");
    });

    it("should handle various token formats", () => {
      const tokenFormats = [
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiQURNSU4ifQ.hash",
        "Bearer simple-token",
        "Bearer 123456789",
        "Bearer token_with_underscores",
        "Bearer token-with-dashes",
        "Bearer token.with.dots",
      ];

      for (const header of tokenFormats) {
        const expectedToken = header.split(" ")[1];
        const result = sut.extractTokenFromHeader(header);
        expect(result).toBe(expectedToken);
      }
    });

    it("should be case sensitive for Bearer prefix", () => {
      const headers = [
        "bearer token-123",
        "BEARER token-123",
        "Bearer token-123",
      ];

      expect(sut.extractTokenFromHeader(headers[0])).toBeNull();
      expect(sut.extractTokenFromHeader(headers[1])).toBeNull();
      expect(sut.extractTokenFromHeader(headers[2])).toBe("token-123");
    });
  });

  describe("environment variable edge cases", () => {
    beforeEach(() => {
      // Reset para valores padrão antes de cada teste
      process.env.NODE_ENV = "test";
      process.env.JWT_ACCESS_SECRET = "test-access-secret";
      process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    });

    it("should throw ConfigurationError when JWT secrets are empty", () => {
      process.env.JWT_ACCESS_SECRET = "";
      process.env.JWT_REFRESH_SECRET = "";

      expect(() => new JsonWebTokenHandlerAdapter()).toThrow(
        "Erro de configuração: JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser configurados via variáveis de ambiente",
      );
    });

    it("should throw ConfigurationError when JWT_ACCESS_SECRET is too short in production", () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_ACCESS_SECRET = "short"; // menos de 32 caracteres
      process.env.JWT_REFRESH_SECRET =
        "this-is-a-long-enough-refresh-secret-for-production";

      expect(() => new JsonWebTokenHandlerAdapter()).toThrow(
        "Erro de configuração: JWT_ACCESS_SECRET deve ter no mínimo 32 caracteres em produção",
      );
    });

    it("should throw ConfigurationError when JWT_REFRESH_SECRET is too short in production", () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_ACCESS_SECRET =
        "this-is-a-long-enough-access-secret-for-production";
      process.env.JWT_REFRESH_SECRET = "short"; // menos de 32 caracteres

      expect(() => new JsonWebTokenHandlerAdapter()).toThrow(
        "Erro de configuração: JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres em produção",
      );
    });

    it("should throw ConfigurationError when both secrets are too short in production", () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_ACCESS_SECRET = "short-access";
      process.env.JWT_REFRESH_SECRET = "short-refresh";

      expect(() => new JsonWebTokenHandlerAdapter()).toThrow(
        "Erro de configuração: JWT_ACCESS_SECRET deve ter no mínimo 32 caracteres em produção",
      );
    });

    it("should allow short secrets in development", () => {
      process.env.NODE_ENV = "development";
      process.env.JWT_ACCESS_SECRET = "short";
      process.env.JWT_REFRESH_SECRET = "short";

      expect(() => new JsonWebTokenHandlerAdapter()).not.toThrow();
    });

    it("should allow exactly 32 characters in production", () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_ACCESS_SECRET = "12345678901234567890123456789012"; // exatamente 32
      process.env.JWT_REFRESH_SECRET = "12345678901234567890123456789012"; // exatamente 32

      expect(() => new JsonWebTokenHandlerAdapter()).not.toThrow();
    });
  });
});
