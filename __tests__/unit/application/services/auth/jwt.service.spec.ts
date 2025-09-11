import {
  InvalidParamError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import { JWTService } from "../../../../../src/application/services";

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

describe("JWTService", () => {
  let sut: JWTService;
  let mockSign: jest.Mock;
  let mockVerify: jest.Mock;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get fresh mocks for each test
    const jwt = require("jsonwebtoken");
    mockSign = jwt.sign as jest.Mock;
    mockVerify = jwt.verify as jest.Mock;

    // Reset environment variables
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: "test-access-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret",
      JWT_ACCESS_EXPIRY: "15m",
      JWT_REFRESH_EXPIRY: "7d",
    };

    sut = new JWTService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("constructor", () => {
    it("should use environment variables when available", () => {
      process.env.JWT_ACCESS_SECRET = "custom-access-secret";
      process.env.JWT_REFRESH_SECRET = "custom-refresh-secret";
      process.env.JWT_ACCESS_EXPIRY = "30m";
      process.env.JWT_REFRESH_EXPIRY = "14d";

      const service = new JWTService();

      // Test by generating a token to verify secrets are used
      const payload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockSign.mockReturnValue("mocked-token");
      service.generateAccessToken(payload);

      expect(mockSign).toHaveBeenCalledWith(payload, "custom-access-secret", {
        expiresIn: "30m",
        issuer: "forcemap-api",
        audience: "forcemap-client",
      });
    });

    it("should use default values when environment variables are not set", () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      delete process.env.JWT_ACCESS_EXPIRY;
      delete process.env.JWT_REFRESH_EXPIRY;

      const service = new JWTService();

      const payload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockSign.mockReturnValue("mocked-token");
      service.generateAccessToken(payload);

      expect(mockSign).toHaveBeenCalledWith(payload, "your-access-secret", {
        expiresIn: "15m",
        issuer: "forcemap-api",
        audience: "forcemap-client",
      });
    });
  });

  describe("generateAccessToken", () => {
    const validPayload = {
      userId: "user-123",
      sessionId: "session-123",
      role: "ADMIN",
      militaryId: "military-123",
    };

    it("should generate access token with valid payload", () => {
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

    it("should throw InvalidParamError when sign fails", () => {
      mockSign.mockImplementation(() => {
        throw new Error("Sign error");
      });

      expect(() => sut.generateAccessToken(validPayload)).toThrow(
        new InvalidParamError("Payload do token", "inválido para geração"),
      );
    });

    it("should handle different payload values", () => {
      const payloads = [
        {
          userId: "different-user",
          sessionId: "different-session",
          role: "USER",
          militaryId: "different-military",
        },
        {
          userId: "123",
          sessionId: "456",
          role: "ADMIN",
          militaryId: "789",
        },
      ];

      mockSign.mockReturnValue("token");

      payloads.forEach((payload) => {
        sut.generateAccessToken(payload);
        expect(mockSign).toHaveBeenCalledWith(
          payload,
          "test-access-secret",
          expect.any(Object),
        );
      });

      expect(mockSign).toHaveBeenCalledTimes(payloads.length);
    });
  });

  describe("generateRefreshToken", () => {
    const validPayload = {
      userId: "user-123",
      sessionId: "session-123",
    };

    it("should generate refresh token with valid payload", () => {
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

    it("should throw InvalidParamError when sign fails", () => {
      mockSign.mockImplementation(() => {
        throw new Error("Sign error");
      });

      expect(() => sut.generateRefreshToken(validPayload)).toThrow(
        new InvalidParamError(
          "Payload do refresh token",
          "inválido para geração",
        ),
      );
    });

    it("should handle different payload values", () => {
      const payloads = [
        { userId: "user-1", sessionId: "session-1" },
        { userId: "user-2", sessionId: "session-2" },
      ];

      mockSign.mockReturnValue("token");

      payloads.forEach((payload) => {
        sut.generateRefreshToken(payload);
        expect(mockSign).toHaveBeenCalledWith(
          payload,
          "test-refresh-secret",
          expect.any(Object),
        );
      });

      expect(mockSign).toHaveBeenCalledTimes(payloads.length);
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

    it("should verify valid access token", () => {
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

    it("should throw UnauthorizedError when token is empty", () => {
      expect(() => sut.verifyAccessToken("")).toThrow(
        new UnauthorizedError("Token de acesso obrigatório"),
      );

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when token is null", () => {
      expect(() => sut.verifyAccessToken(null as any)).toThrow(
        new UnauthorizedError("Token de acesso obrigatório"),
      );

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when token is not a string", () => {
      expect(() => sut.verifyAccessToken(123 as any)).toThrow(
        new UnauthorizedError("Token de acesso obrigatório"),
      );

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when token is expired", () => {
      const jwt = require("jsonwebtoken");
      const expiredError = new jwt.TokenExpiredError("jwt expired", new Date());
      mockVerify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Token de acesso expirado"),
      );
    });

    it("should throw UnauthorizedError when token is malformed", () => {
      const jwt = require("jsonwebtoken");
      const malformedError = new jwt.JsonWebTokenError("jwt malformed");
      mockVerify.mockImplementation(() => {
        throw malformedError;
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Token de acesso inválido"),
      );
    });

    it("should throw UnauthorizedError when decoded token is missing userId", () => {
      const invalidPayload = {
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Token de acesso inválido"),
      );
    });

    it("should throw UnauthorizedError when decoded token is missing sessionId", () => {
      const invalidPayload = {
        userId: "user-123",
        role: "ADMIN",
        militaryId: "military-123",
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Token de acesso inválido"),
      );
    });

    it("should throw UnauthorizedError when decoded token is missing role", () => {
      const invalidPayload = {
        userId: "user-123",
        sessionId: "session-123",
        militaryId: "military-123",
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Token de acesso inválido"),
      );
    });

    it("should throw UnauthorizedError when decoded token is missing militaryId", () => {
      const invalidPayload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Token de acesso inválido"),
      );
    });

    it("should re-throw UnauthorizedError when already UnauthorizedError", () => {
      const unauthorizedError = new UnauthorizedError("Custom unauthorized");
      mockVerify.mockImplementation(() => {
        throw unauthorizedError;
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        unauthorizedError,
      );
    });

    it("should throw generic UnauthorizedError for unknown errors", () => {
      mockVerify.mockImplementation(() => {
        throw new Error("Unknown error");
      });

      expect(() => sut.verifyAccessToken(validToken)).toThrow(
        new UnauthorizedError("Erro na validação do token de acesso"),
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

    it("should verify valid refresh token", () => {
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

    it("should throw UnauthorizedError when token is empty", () => {
      expect(() => sut.verifyRefreshToken("")).toThrow(
        new UnauthorizedError("Refresh token obrigatório"),
      );

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when token is null", () => {
      expect(() => sut.verifyRefreshToken(null as any)).toThrow(
        new UnauthorizedError("Refresh token obrigatório"),
      );

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when token is not a string", () => {
      expect(() => sut.verifyRefreshToken(123 as any)).toThrow(
        new UnauthorizedError("Refresh token obrigatório"),
      );

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError when token is expired", () => {
      const jwt = require("jsonwebtoken");
      const expiredError = new jwt.TokenExpiredError("jwt expired", new Date());
      mockVerify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        new UnauthorizedError("Refresh token expirado"),
      );
    });

    it("should throw UnauthorizedError when token is malformed", () => {
      const jwt = require("jsonwebtoken");
      const malformedError = new jwt.JsonWebTokenError("jwt malformed");
      mockVerify.mockImplementation(() => {
        throw malformedError;
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        new UnauthorizedError("Refresh token inválido"),
      );
    });

    it("should throw UnauthorizedError when decoded token is missing userId", () => {
      const invalidPayload = {
        sessionId: "session-123",
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        new UnauthorizedError("Refresh token inválido"),
      );
    });

    it("should throw UnauthorizedError when decoded token is missing sessionId", () => {
      const invalidPayload = {
        userId: "user-123",
      };
      mockVerify.mockReturnValue(invalidPayload);

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        new UnauthorizedError("Refresh token inválido"),
      );
    });

    it("should re-throw UnauthorizedError when already UnauthorizedError", () => {
      const unauthorizedError = new UnauthorizedError("Custom unauthorized");
      mockVerify.mockImplementation(() => {
        throw unauthorizedError;
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        unauthorizedError,
      );
    });

    it("should throw generic UnauthorizedError for unknown errors", () => {
      mockVerify.mockImplementation(() => {
        throw new Error("Unknown error");
      });

      expect(() => sut.verifyRefreshToken(validToken)).toThrow(
        new UnauthorizedError("Erro na validação do refresh token"),
      );
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract token from valid Bearer header", () => {
      const token = "valid-jwt-token";
      const header = `Bearer ${token}`;

      const result = sut.extractTokenFromHeader(header);

      expect(result).toBe(token);
    });

    it("should return null when header is undefined", () => {
      const result = sut.extractTokenFromHeader(undefined);

      expect(result).toBeNull();
    });

    it("should return null when header is null", () => {
      const result = sut.extractTokenFromHeader(null as any);

      expect(result).toBeNull();
    });

    it("should return null when header is not a string", () => {
      const result = sut.extractTokenFromHeader(123 as any);

      expect(result).toBeNull();
    });

    it("should return null when header is empty string", () => {
      const result = sut.extractTokenFromHeader("");

      expect(result).toBeNull();
    });

    it("should return null when header does not start with Bearer", () => {
      const result = sut.extractTokenFromHeader("Basic token123");

      expect(result).toBeNull();
    });

    it("should return null when header has wrong format", () => {
      const testCases = [
        "Bearer", // Missing token
        "Bearer token1 token2 extra", // Too many parts
        "token123", // Missing Bearer
        "bearer token123", // Wrong case
      ];

      testCases.forEach((header) => {
        const result = sut.extractTokenFromHeader(header);
        expect(result).toBeNull();
      });
    });

    it("should return null when token is empty", () => {
      const result = sut.extractTokenFromHeader("Bearer ");

      expect(result).toBeNull();
    });

    it("should return null when token is only whitespace", () => {
      const result = sut.extractTokenFromHeader("Bearer    ");

      expect(result).toBeNull();
    });

    it("should handle single space before token", () => {
      const token = "valid-token";
      const header = `Bearer ${token}`;

      const result = sut.extractTokenFromHeader(header);

      expect(result).toBe(token);
    });

    it("should return null with multiple spaces (current behavior)", () => {
      const token = "valid-token";
      const header = `Bearer   ${token}   `;

      const result = sut.extractTokenFromHeader(header);

      // Current implementation splits on single space, so multiple spaces create more parts
      expect(result).toBeNull();
    });

    it("should handle various valid token formats", () => {
      const validTokens = [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.signature",
        "simple-token",
        "token_with_underscore",
        "token-with-dash",
        "token123",
      ];

      validTokens.forEach((token) => {
        const header = `Bearer ${token}`;
        const result = sut.extractTokenFromHeader(header);
        expect(result).toBe(token);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete access token flow", () => {
      const payload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      // Generate token
      const generatedToken = "generated-access-token";
      mockSign.mockReturnValue(generatedToken);
      const token = sut.generateAccessToken(payload);

      // Verify token
      const decodedPayload = { ...payload, iat: 123, exp: 456 };
      mockVerify.mockReturnValue(decodedPayload);
      const result = sut.verifyAccessToken(token);

      expect(token).toBe(generatedToken);
      expect(result).toEqual(decodedPayload);
    });

    it("should handle complete refresh token flow", () => {
      const payload = {
        userId: "user-123",
        sessionId: "session-123",
      };

      // Generate token
      const generatedToken = "generated-refresh-token";
      mockSign.mockReturnValue(generatedToken);
      const token = sut.generateRefreshToken(payload);

      // Verify token
      const decodedPayload = { ...payload, iat: 123, exp: 456 };
      mockVerify.mockReturnValue(decodedPayload);
      const result = sut.verifyRefreshToken(token);

      expect(token).toBe(generatedToken);
      expect(result).toEqual(decodedPayload);
    });

    it("should handle token extraction and verification flow", () => {
      const token = "extracted-token";
      const header = `Bearer ${token}`;

      // Extract token
      const extractedToken = sut.extractTokenFromHeader(header);
      expect(extractedToken).toBe(token);

      // Verify extracted token
      const decodedPayload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
        iat: 123,
        exp: 456,
      };
      mockVerify.mockReturnValue(decodedPayload);
      const result = sut.verifyAccessToken(extractedToken!);

      expect(result).toEqual(decodedPayload);
    });

    it("should handle error scenarios in token flow", () => {
      const header = "Invalid header format";

      // Extract token should fail
      const extractedToken = sut.extractTokenFromHeader(header);
      expect(extractedToken).toBeNull();

      // Verify should fail with empty token
      expect(() => sut.verifyAccessToken("")).toThrow(UnauthorizedError);

      // Generate should fail with sign error
      mockSign.mockImplementation(() => {
        throw new Error("Sign failed");
      });

      expect(() =>
        sut.generateAccessToken({
          userId: "test",
          sessionId: "test",
          role: "test",
          militaryId: "test",
        }),
      ).toThrow(InvalidParamError);
    });
  });
});
