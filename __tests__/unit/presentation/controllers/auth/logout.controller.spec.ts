import { mockAuthService, mockLogger } from "../../../../../__mocks__";
import { LogoutController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
}

describe("LogoutController", () => {
  let sut: LogoutController;
  let mockedAuthService = mockAuthService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new LogoutController({
      authService: mockedAuthService as any,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validRequest: AuthenticatedRequest = {
      user: {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      },
    };

    it("should logout successfully with valid authenticated request", async () => {
      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(mockedAuthService.logout).toHaveBeenCalledWith("session-123");
      expect(mockedAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving logout request", async () => {
      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para logout",
        {
          userId: "user-123",
          sessionId: "session-123",
        },
      );
    });

    it("should log info when logout is successful", async () => {
      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Logout realizado com sucesso",
        {
          userId: "user-123",
          sessionId: "session-123",
        },
      );
    });

    it("should handle request without user (unauthenticated)", async () => {
      const unauthenticatedRequest: AuthenticatedRequest = {};

      const result = await sut.handle(unauthenticatedRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(mockedAuthService.logout).not.toHaveBeenCalled();
    });

    it("should log info for unauthenticated request", async () => {
      const unauthenticatedRequest: AuthenticatedRequest = {};

      await sut.handle(unauthenticatedRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para logout",
        {
          userId: undefined,
          sessionId: undefined,
        },
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Logout realizado com sucesso",
        {
          userId: undefined,
          sessionId: undefined,
        },
      );
    });

    it("should handle request with user but no sessionId", async () => {
      const requestWithoutSessionId: AuthenticatedRequest = {
        user: {
          userId: "user-123",
          sessionId: "",
          role: "ADMIN",
          militaryId: "military-123",
        },
      };

      const result = await sut.handle(requestWithoutSessionId);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(mockedAuthService.logout).not.toHaveBeenCalled();
    });

    it("should handle request with undefined sessionId", async () => {
      const requestWithUndefinedSessionId: AuthenticatedRequest = {
        user: {
          userId: "user-123",
          sessionId: undefined as any,
          role: "ADMIN",
          militaryId: "military-123",
        },
      };

      const result = await sut.handle(requestWithUndefinedSessionId);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(mockedAuthService.logout).not.toHaveBeenCalled();
    });

    it("should handle auth service errors gracefully", async () => {
      const serviceError = new Error("Session not found");
      mockedAuthService.logout.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedAuthService.logout).toHaveBeenCalledWith("session-123");
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new Error("Database connection failed");
      mockedAuthService.logout.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao realizar logout",
        {
          error: serviceError,
          requestData: { userId: "user-123" },
        },
      );
    });

    it("should handle logout with different user roles", async () => {
      const roles = ["ADMIN", "CHEFE", "ACA", "BOMBEIRO"];

      for (const role of roles) {
        const requestWithRole: AuthenticatedRequest = {
          user: {
            userId: "user-123",
            sessionId: "session-123",
            role,
            militaryId: "military-123",
          },
        };

        mockedAuthService.logout.mockResolvedValueOnce(undefined);

        const result = await sut.handle(requestWithRole);

        expect(result).toEqual({
          statusCode: 200,
          body: { data: { message: "Logout realizado com sucesso" } },
        });
        expect(mockedAuthService.logout).toHaveBeenCalledWith("session-123");
      }
    });

    it("should handle concurrent logout requests independently", async () => {
      const request1: AuthenticatedRequest = {
        user: {
          userId: "user-1",
          sessionId: "session-1",
          role: "ADMIN",
          militaryId: "military-1",
        },
      };
      const request2: AuthenticatedRequest = {
        user: {
          userId: "user-2",
          sessionId: "session-2",
          role: "CHEFE",
          militaryId: "military-2",
        },
      };

      mockedAuthService.logout
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(result2).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(mockedAuthService.logout).toHaveBeenCalledTimes(2);
      expect(mockedAuthService.logout).toHaveBeenNthCalledWith(1, "session-1");
      expect(mockedAuthService.logout).toHaveBeenNthCalledWith(2, "session-2");
    });

    it("should preserve request data structure integrity", async () => {
      const complexRequest: AuthenticatedRequest = {
        user: {
          userId: "complex-user-123",
          sessionId: "complex-session-456",
          role: "ADMIN",
          militaryId: "complex-military-789",
        },
      };

      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      await sut.handle(complexRequest);

      expect(mockedAuthService.logout).toHaveBeenCalledWith(
        "complex-session-456",
      );

      const calledWith = mockedAuthService.logout.mock.calls[0][0];
      expect(typeof calledWith).toBe("string");
      expect(calledWith).toBe("complex-session-456");
    });

    it("should not modify the original request", async () => {
      const originalRequest: AuthenticatedRequest = {
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
      };

      const requestCopy = JSON.parse(JSON.stringify(originalRequest));

      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      await sut.handle(originalRequest);

      expect(originalRequest).toEqual(requestCopy);
    });

    it("should handle different session ID formats", async () => {
      const sessionIds = [
        "session-123",
        "550e8400-e29b-41d4-a716-446655440000",
        "abc123def456",
        "session_with_underscores",
        "session-with-dashes-123",
      ];

      for (const sessionId of sessionIds) {
        const requestWithSessionId: AuthenticatedRequest = {
          user: {
            userId: "user-123",
            sessionId,
            role: "ADMIN",
            militaryId: "military-123",
          },
        };

        mockedAuthService.logout.mockResolvedValueOnce(undefined);

        const result = await sut.handle(requestWithSessionId);

        expect(result.statusCode).toBe(200);
        expect(mockedAuthService.logout).toHaveBeenCalledWith(sessionId);
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Logout realizado com sucesso",
          {
            userId: "user-123",
            sessionId,
          },
        );
      }
    });

    it("should maintain consistent response structure", async () => {
      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      const result = await sut.handle(validRequest);

      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("body");
      expect(result.body).toHaveProperty("data");
      expect(result.body?.data).toHaveProperty("message");

      const responseData = result.body?.data as { message: string };
      expect(typeof responseData.message).toBe("string");
    });

    it("should handle multiple consecutive logout requests", async () => {
      mockedAuthService.logout.mockResolvedValue(undefined);

      const results: any[] = [];
      for (let i = 0; i < 3; i++) {
        const result = await sut.handle(validRequest);
        results.push(result);
      }

      results.forEach((result) => {
        expect(result).toEqual({
          statusCode: 200,
          body: { data: { message: "Logout realizado com sucesso" } },
        });
      });
      expect(mockedAuthService.logout).toHaveBeenCalledTimes(3);
    });

    it("should handle auth service timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      timeoutError.name = "TimeoutError";
      mockedAuthService.logout.mockRejectedValueOnce(timeoutError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao realizar logout",
        {
          error: timeoutError,
          requestData: { userId: "user-123" },
        },
      );
    });

    it("should handle auth service connection errors", async () => {
      const connectionError = new Error("Database connection lost");
      connectionError.name = "ConnectionError";
      mockedAuthService.logout.mockRejectedValueOnce(connectionError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedAuthService.logout).toHaveBeenCalledWith("session-123");
    });

    it("should handle requests with all user properties", async () => {
      const fullRequest: AuthenticatedRequest = {
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
      };

      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      const result = await sut.handle(fullRequest);

      expect(result.statusCode).toBe(200);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para logout",
        {
          userId: "user-123",
          sessionId: "session-123",
        },
      );
    });

    it("should handle edge case with empty string values", async () => {
      const requestWithEmptyStrings: AuthenticatedRequest = {
        user: {
          userId: "",
          sessionId: "",
          role: "",
          militaryId: "",
        },
      };

      const result = await sut.handle(requestWithEmptyStrings);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: { message: "Logout realizado com sucesso" } },
      });
      expect(mockedAuthService.logout).not.toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Logout realizado com sucesso",
        {
          userId: "",
          sessionId: "",
        },
      );
    });
  });
});
