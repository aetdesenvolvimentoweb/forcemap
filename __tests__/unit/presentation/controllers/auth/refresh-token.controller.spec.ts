import { mockAuthService, mockLogger } from "../../../../../__mocks__";
import { UnauthorizedError } from "../../../../../src/application/errors";
import {
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { RefreshTokenController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

interface RefreshTokenHttpRequest extends HttpRequest<RefreshTokenInputDTO> {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers?: { [key: string]: string | string[] | undefined };
}

describe("RefreshTokenController", () => {
  let sut: RefreshTokenController;
  let mockedAuthService = mockAuthService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new RefreshTokenController({
      authService: mockedAuthService as any,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: RefreshTokenInputDTO = {
      refreshToken: "valid.refresh.token",
    };

    const mockRefreshResult: LoginOutputDTO = {
      accessToken: "new.access.token",
      refreshToken: "valid.refresh.token",
      user: {
        id: "user-123",
        militaryId: "military-123",
        role: UserRole.ADMIN,
      },
      expiresIn: 900,
    };

    const validRequest: RefreshTokenHttpRequest = {
      body: validBody,
      ip: "192.168.1.1",
      headers: {
        "user-agent": "Test User Agent",
      },
    };

    it("should refresh token successfully with valid refresh token", async () => {
      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockRefreshResult },
      });
      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
      expect(mockedAuthService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving refresh token request", async () => {
      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para renovar token",
        {
          ip: "192.168.1.1",
        },
      );
    });

    it("should log info when token is refreshed successfully", async () => {
      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Token renovado com sucesso",
        {
          userId: mockRefreshResult.user.id,
          ip: "192.168.1.1",
        },
      );
    });

    it("should use socket.remoteAddress when ip is not available", async () => {
      const requestWithSocket: RefreshTokenHttpRequest = {
        body: validBody,
        socket: { remoteAddress: "10.0.0.1" },
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(requestWithSocket);

      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "10.0.0.1",
        "Test User Agent",
      );
    });

    it("should use 'unknown' when no IP is available", async () => {
      const requestWithoutIP: RefreshTokenHttpRequest = {
        body: validBody,
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(requestWithoutIP);

      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "unknown",
        "Test User Agent",
      );
    });

    it("should use 'unknown' when no user-agent is available", async () => {
      const requestWithoutUserAgent: RefreshTokenHttpRequest = {
        body: validBody,
        ip: "192.168.1.1",
      };

      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(requestWithoutUserAgent);

      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "unknown",
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: RefreshTokenHttpRequest = {
        ip: "192.168.1.1",
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: RefreshTokenHttpRequest = {
        body: null as any,
        ip: "192.168.1.1",
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is undefined", async () => {
      const requestWithUndefinedBody: RefreshTokenHttpRequest = {
        body: undefined,
        ip: "192.168.1.1",
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: RefreshTokenHttpRequest = {
        ip: "192.168.1.1",
      };

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle unauthorized error from auth service", async () => {
      const serviceError = new UnauthorizedError("Refresh token inválido");
      mockedAuthService.refreshToken.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new UnauthorizedError("Refresh token expirado");
      mockedAuthService.refreshToken.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao renovar token", {
        error: serviceError,
        requestData: { refreshToken: "hidden" },
      });
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedAuthService.refreshToken.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
    });

    it("should handle refresh token with different user roles", async () => {
      const roles = [
        UserRole.ADMIN,
        UserRole.CHEFE,
        UserRole.ACA,
        UserRole.BOMBEIRO,
      ];

      for (const role of roles) {
        const refreshResult: LoginOutputDTO = {
          ...mockRefreshResult,
          user: { ...mockRefreshResult.user, role },
        };

        mockedAuthService.refreshToken.mockResolvedValueOnce(refreshResult);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          statusCode: 200,
          body: { data: refreshResult },
        });
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Token renovado com sucesso",
          {
            userId: refreshResult.user.id,
            ip: "192.168.1.1",
          },
        );
      }
    });

    it("should handle complex user agent strings", async () => {
      const complexUserAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

      const requestWithComplexUserAgent: RefreshTokenHttpRequest = {
        body: validBody,
        ip: "192.168.1.1",
        headers: {
          "user-agent": complexUserAgent,
        },
      };

      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(requestWithComplexUserAgent);

      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        complexUserAgent,
      );
    });

    it("should handle concurrent refresh token requests independently", async () => {
      const body1: RefreshTokenInputDTO = {
        refreshToken: "refresh.token.1",
      };
      const body2: RefreshTokenInputDTO = {
        refreshToken: "refresh.token.2",
      };

      const refreshResult1: LoginOutputDTO = {
        ...mockRefreshResult,
        user: { ...mockRefreshResult.user, id: "user-1" },
        accessToken: "access.token.1",
      };
      const refreshResult2: LoginOutputDTO = {
        ...mockRefreshResult,
        user: { ...mockRefreshResult.user, id: "user-2" },
        accessToken: "access.token.2",
      };

      const request1: RefreshTokenHttpRequest = {
        body: body1,
        ip: "192.168.1.1",
        headers: { "user-agent": "Agent 1" },
      };
      const request2: RefreshTokenHttpRequest = {
        body: body2,
        ip: "192.168.1.2",
        headers: { "user-agent": "Agent 2" },
      };

      mockedAuthService.refreshToken
        .mockResolvedValueOnce(refreshResult1)
        .mockResolvedValueOnce(refreshResult2);

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({
        statusCode: 200,
        body: { data: refreshResult1 },
      });
      expect(result2).toEqual({
        statusCode: 200,
        body: { data: refreshResult2 },
      });
      expect(mockedAuthService.refreshToken).toHaveBeenCalledTimes(2);
      expect(mockedAuthService.refreshToken).toHaveBeenNthCalledWith(
        1,
        body1,
        "192.168.1.1",
        "Agent 1",
      );
      expect(mockedAuthService.refreshToken).toHaveBeenNthCalledWith(
        2,
        body2,
        "192.168.1.2",
        "Agent 2",
      );
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: RefreshTokenInputDTO = {
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.complexToken",
      };

      const request: RefreshTokenHttpRequest = {
        body: complexBody,
        ip: "192.168.1.1",
        headers: {
          "user-agent": "Complex User Agent",
        },
      };

      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(request);

      expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
        complexBody,
        "192.168.1.1",
        "Complex User Agent",
      );

      const calledWith = mockedAuthService.refreshToken.mock.calls[0];
      expect(calledWith[0]).toHaveProperty("refreshToken");
      expect(typeof calledWith[0].refreshToken).toBe("string");
      expect(typeof calledWith[1]).toBe("string"); // IP address
      expect(typeof calledWith[2]).toBe("string"); // User agent
    });

    it("should not modify the original request body", async () => {
      const originalBody: RefreshTokenInputDTO = {
        refreshToken: "original.refresh.token",
      };

      const request: RefreshTokenHttpRequest = {
        body: { ...originalBody },
        ip: "192.168.1.1",
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });

    it("should handle IP addresses with different formats", async () => {
      const ipAddresses = [
        "192.168.1.1",
        "10.0.0.1",
        "127.0.0.1",
        "::1",
        "2001:db8::1",
      ];

      for (const ip of ipAddresses) {
        const requestWithIP: RefreshTokenHttpRequest = {
          body: validBody,
          ip,
          headers: {
            "user-agent": "Test User Agent",
          },
        };

        mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

        await sut.handle(requestWithIP);

        expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
          validBody,
          ip,
          "Test User Agent",
        );
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Token renovado com sucesso",
          {
            userId: mockRefreshResult.user.id,
            ip,
          },
        );
      }
    });

    it("should maintain consistent response structure", async () => {
      mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

      const result = await sut.handle(validRequest);

      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("body");
      expect(result.body).toHaveProperty("data");

      const refreshData = result.body?.data as LoginOutputDTO;
      expect(refreshData).toHaveProperty("accessToken");
      expect(refreshData).toHaveProperty("refreshToken");
      expect(refreshData).toHaveProperty("user");
      expect(refreshData).toHaveProperty("expiresIn");
      expect(refreshData.user).toHaveProperty("id");
      expect(refreshData.user).toHaveProperty("militaryId");
      expect(refreshData.user).toHaveProperty("role");
    });

    it("should handle different refresh token formats", async () => {
      const refreshTokens = [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1",
        "simple.token.format",
        "bearer-token-123456",
        "jwt.refresh.token.example",
        "token_with_underscores_123",
      ];

      for (const refreshToken of refreshTokens) {
        const bodyWithToken: RefreshTokenInputDTO = {
          refreshToken,
        };

        const requestWithToken: RefreshTokenHttpRequest = {
          body: bodyWithToken,
          ip: "192.168.1.1",
          headers: {
            "user-agent": "Test User Agent",
          },
        };

        mockedAuthService.refreshToken.mockResolvedValueOnce(mockRefreshResult);

        await sut.handle(requestWithToken);

        expect(mockedAuthService.refreshToken).toHaveBeenCalledWith(
          bodyWithToken,
          "192.168.1.1",
          "Test User Agent",
        );
      }
    });

    it("should handle session compromise detection", async () => {
      const serviceError = new UnauthorizedError(
        "Sessão comprometida detectada",
      );
      mockedAuthService.refreshToken.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao renovar token", {
        error: serviceError,
        requestData: { refreshToken: "hidden" },
      });
    });

    it("should handle expired refresh token", async () => {
      const serviceError = new UnauthorizedError("Refresh token expirado");
      mockedAuthService.refreshToken.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should mask refresh token in error logs", async () => {
      const serviceError = new Error("Service error");
      mockedAuthService.refreshToken.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao renovar token", {
        error: serviceError,
        requestData: { refreshToken: "hidden" },
      });
    });

    it("should handle refresh token with different expiration times", async () => {
      const expirationTimes = [900, 1800, 3600, 7200]; // 15min, 30min, 1h, 2h

      for (const expiresIn of expirationTimes) {
        const refreshResult: LoginOutputDTO = {
          ...mockRefreshResult,
          expiresIn,
        };

        mockedAuthService.refreshToken.mockResolvedValueOnce(refreshResult);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          statusCode: 200,
          body: { data: refreshResult },
        });
        expect(refreshResult.expiresIn).toBe(expiresIn);
      }
    });
  });
});
