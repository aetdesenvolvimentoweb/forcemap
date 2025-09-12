import { mockLogger, mockRefreshTokenService } from "../../../../../__mocks__";
import {
  TooManyRequestsError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import {
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../../../src/domain/dtos/auth";
import { UserRole } from "../../../../../src/domain/entities";
import { RefreshTokenController } from "../../../../../src/presentation/controllers/auth/refresh-token.controller";
import { HttpRequest } from "../../../../../src/presentation/protocols";

interface RefreshTokenHttpRequest extends HttpRequest<RefreshTokenInputDTO> {
  ip?: string;
  connection?: { remoteAddress?: string };
  socket?: { remoteAddress?: string };
  headers?: { [key: string]: string | string[] | undefined };
}

describe("RefreshTokenController", () => {
  let sut: RefreshTokenController;
  let mockedRefreshTokenService = mockRefreshTokenService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new RefreshTokenController({
      refreshTokenService: mockedRefreshTokenService as any,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: RefreshTokenInputDTO = {
      refreshToken: "valid.refresh.token",
    };

    const mockRefreshResult: LoginOutputDTO = {
      accessToken: "new.access.token",
      refreshToken: "new.refresh.token",
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
    };

    it("should refresh token successfully with valid refresh token", async () => {
      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockRefreshResult },
      });
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
      );
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving refresh token request", async () => {
      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para renovar token",
        {
          ip: "192.168.1.1",
        },
      );
    });

    it("should log info when token refresh is successful", async () => {
      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

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
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(requestWithSocket);

      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "10.0.0.1",
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Token renovado com sucesso",
        {
          userId: mockRefreshResult.user.id,
          ip: "10.0.0.1",
        },
      );
    });

    it("should prioritize ip over socket.remoteAddress", async () => {
      const requestWithBoth: RefreshTokenHttpRequest = {
        body: validBody,
        ip: "192.168.1.1",
        socket: { remoteAddress: "10.0.0.1" },
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(requestWithBoth);

      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
      );
    });

    it("should use 'unknown' when no IP is available", async () => {
      const requestWithoutIP: RefreshTokenHttpRequest = {
        body: validBody,
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(requestWithoutIP);

      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "unknown",
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Token renovado com sucesso",
        {
          userId: mockRefreshResult.user.id,
          ip: "unknown",
        },
      );
    });

    it("should log info with undefined ip when request has no ip", async () => {
      const requestWithoutIP: RefreshTokenHttpRequest = {
        body: validBody,
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(requestWithoutIP);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para renovar token",
        {
          ip: undefined,
        },
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
      expect(mockedRefreshTokenService.refreshToken).not.toHaveBeenCalled();
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
      expect(mockedRefreshTokenService.refreshToken).not.toHaveBeenCalled();
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
      expect(mockedRefreshTokenService.refreshToken).not.toHaveBeenCalled();
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
      mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
        serviceError,
      );

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
      );
    });

    it("should handle too many requests error from auth service", async () => {
      const serviceError = new TooManyRequestsError(
        "Muitas tentativas de renovação de token. Tente novamente em 5 minutos.",
      );
      mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
        serviceError,
      );

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
      );
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new UnauthorizedError("Refresh token inválido");
      mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
        serviceError,
      );

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao renovar token", {
        error: serviceError,
        requestData: { refreshToken: "hidden" },
      });
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
        unknownError,
      );

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
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

        mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
          refreshResult,
        );

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

    it("should handle different refresh token formats", async () => {
      const refreshTokens = [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "refresh_abc123def456",
        "simple-refresh-token",
        "UPPERCASE-REFRESH-TOKEN",
      ];

      for (const refreshToken of refreshTokens) {
        const bodyWithToken: RefreshTokenInputDTO = {
          refreshToken,
        };

        const requestWithToken: RefreshTokenHttpRequest = {
          body: bodyWithToken,
          ip: "192.168.1.1",
        };

        mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
          mockRefreshResult,
        );

        await sut.handle(requestWithToken);

        expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
          bodyWithToken,
          "192.168.1.1",
        );
      }
    });

    it("should handle different IP address formats", async () => {
      const ipAddresses = [
        "192.168.1.1",
        "10.0.0.1",
        "127.0.0.1",
        "::1",
        "2001:db8::1",
        "172.16.254.1",
      ];

      for (const ip of ipAddresses) {
        const requestWithIP: RefreshTokenHttpRequest = {
          body: validBody,
          ip,
        };

        mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
          mockRefreshResult,
        );

        await sut.handle(requestWithIP);

        expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
          validBody,
          ip,
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

    it("should handle concurrent refresh requests independently", async () => {
      const body1: RefreshTokenInputDTO = {
        refreshToken: "refresh.token.1",
      };
      const body2: RefreshTokenInputDTO = {
        refreshToken: "refresh.token.2",
      };

      const refreshResult1: LoginOutputDTO = {
        ...mockRefreshResult,
        user: { ...mockRefreshResult.user, id: "user-1" },
      };
      const refreshResult2: LoginOutputDTO = {
        ...mockRefreshResult,
        user: { ...mockRefreshResult.user, id: "user-2" },
      };

      const request1: RefreshTokenHttpRequest = {
        body: body1,
        ip: "192.168.1.1",
      };
      const request2: RefreshTokenHttpRequest = {
        body: body2,
        ip: "192.168.1.2",
      };

      mockedRefreshTokenService.refreshToken
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
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledTimes(2);
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenNthCalledWith(
        1,
        body1,
        "192.168.1.1",
      );
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenNthCalledWith(
        2,
        body2,
        "192.168.1.2",
      );
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: RefreshTokenInputDTO = {
        refreshToken: "complex.refresh.token.with.long.string.123456789",
      };

      const request: RefreshTokenHttpRequest = {
        body: complexBody,
        ip: "192.168.1.1",
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(request);

      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        complexBody,
        "192.168.1.1",
      );

      const calledWith = mockedRefreshTokenService.refreshToken.mock.calls[0];
      expect(calledWith[0]).toHaveProperty("refreshToken");
      expect(typeof calledWith[0].refreshToken).toBe("string");
      expect(typeof calledWith[1]).toBe("string"); // IP address
    });

    it("should not modify the original request body", async () => {
      const originalBody: RefreshTokenInputDTO = {
        refreshToken: "original.refresh.token",
      };

      const request: RefreshTokenHttpRequest = {
        body: { ...originalBody },
        ip: "192.168.1.1",
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });

    it("should maintain consistent response structure", async () => {
      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

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

    it("should handle empty string refresh token", async () => {
      const bodyWithEmptyToken: RefreshTokenInputDTO = {
        refreshToken: "",
      };

      const requestWithEmptyToken: RefreshTokenHttpRequest = {
        body: bodyWithEmptyToken,
        ip: "192.168.1.1",
      };

      const serviceError = new UnauthorizedError("Refresh token inválido");
      mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
        serviceError,
      );

      const result = await sut.handle(requestWithEmptyToken);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        bodyWithEmptyToken,
        "192.168.1.1",
      );
    });

    it("should handle malformed refresh tokens", async () => {
      const malformedTokens = [
        "invalid.token",
        "expired.refresh.token",
        "malformed",
        "123",
        "null",
        "undefined",
      ];

      for (const refreshToken of malformedTokens) {
        const bodyWithMalformedToken: RefreshTokenInputDTO = {
          refreshToken,
        };

        const requestWithMalformedToken: RefreshTokenHttpRequest = {
          body: bodyWithMalformedToken,
          ip: "192.168.1.1",
        };

        const serviceError = new UnauthorizedError("Refresh token inválido");
        mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
          serviceError,
        );

        const result = await sut.handle(requestWithMalformedToken);

        expect(result).toEqual({
          body: { error: serviceError.message },
          statusCode: serviceError.statusCode,
        });
        expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
          bodyWithMalformedToken,
          "192.168.1.1",
        );
      }
    });

    it("should handle request with headers", async () => {
      const requestWithHeaders: RefreshTokenHttpRequest = {
        body: validBody,
        ip: "192.168.1.1",
        headers: {
          "content-type": "application/json",
          "user-agent": "Test Client",
          authorization: "Bearer some.token",
        },
      };

      mockedRefreshTokenService.refreshToken.mockResolvedValueOnce(
        mockRefreshResult,
      );

      const result = await sut.handle(requestWithHeaders);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockRefreshResult },
      });
      expect(mockedRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
      );
    });

    it("should properly mask refresh token in error logs", async () => {
      const serviceError = new UnauthorizedError("Refresh token inválido");
      mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
        serviceError,
      );

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao renovar token", {
        error: serviceError,
        requestData: { refreshToken: "hidden" },
      });
    });

    it("should handle network-related errors gracefully", async () => {
      const networkErrors = [
        new Error("ECONNREFUSED"),
        new Error("TIMEOUT"),
        new Error("Network is unreachable"),
      ];

      for (const networkError of networkErrors) {
        mockedRefreshTokenService.refreshToken.mockRejectedValueOnce(
          networkError,
        );

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao renovar token",
          {
            error: networkError,
            requestData: { refreshToken: "hidden" },
          },
        );
      }
    });
  });
});
