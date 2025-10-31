import { SecurityLoggerProtocol } from "../../../../../src/application/protocols";
import { LogoutService } from "../../../../../src/application/services/auth/logout.service";
import { SessionRepository } from "../../../../../src/domain/repositories";

describe("LogoutService", () => {
  let sut: LogoutService;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockSecurityLogger: jest.Mocked<SecurityLoggerProtocol>;

  const mockSessionId = "session-123";

  beforeEach(() => {
    mockSessionRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      findByRefreshToken: jest.fn(),
      findBySessionId: jest.fn(),
      findActiveByUserId: jest.fn(),
      updateLastAccess: jest.fn(),
      updateToken: jest.fn(),
      updateRefreshToken: jest.fn(),
      deactivateSession: jest.fn(),
      deactivateAllUserSessions: jest.fn(),
      deleteExpiredSessions: jest.fn(),
    };

    mockSecurityLogger = {
      logLogin: jest.fn(),
      logLoginBlocked: jest.fn(),
      logLogout: jest.fn(),
      logTokenRefresh: jest.fn(),
      logAccessDenied: jest.fn(),
      logSuspiciousActivity: jest.fn(),
    };

    sut = new LogoutService({
      sessionRepository: mockSessionRepository,
      securityLogger: mockSecurityLogger,
    });
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(LogoutService);
      expect(sut.logout).toBeDefined();
    });

    it("should store dependencies correctly", () => {
      const service = new LogoutService({
        sessionRepository: mockSessionRepository,
        securityLogger: mockSecurityLogger,
      });

      expect(service).toBeInstanceOf(LogoutService);
    });
  });

  describe("logout", () => {
    it("should logout successfully with valid session id", async () => {
      mockSessionRepository.deactivateSession.mockResolvedValue();

      await expect(sut.logout(mockSessionId)).resolves.not.toThrow();

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        mockSessionId,
      );
      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(1);
    });

    it("should return void on successful logout", async () => {
      mockSessionRepository.deactivateSession.mockResolvedValue();

      const result = await sut.logout(mockSessionId);

      expect(result).toBeUndefined();
    });

    it("should handle repository errors silently (silent fail)", async () => {
      const repositoryError = new Error("Database connection failed");
      mockSessionRepository.deactivateSession.mockRejectedValue(
        repositoryError,
      );

      await expect(sut.logout(mockSessionId)).resolves.not.toThrow();

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        mockSessionId,
      );
    });

    it("should handle session not found silently", async () => {
      const sessionNotFoundError = new Error("Session not found");
      mockSessionRepository.deactivateSession.mockRejectedValue(
        sessionNotFoundError,
      );

      await expect(sut.logout(mockSessionId)).resolves.not.toThrow();

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        mockSessionId,
      );
    });

    it("should handle already deactivated session silently", async () => {
      const alreadyDeactivatedError = new Error("Session already deactivated");
      mockSessionRepository.deactivateSession.mockRejectedValue(
        alreadyDeactivatedError,
      );

      await expect(sut.logout(mockSessionId)).resolves.not.toThrow();

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        mockSessionId,
      );
    });

    describe("edge cases", () => {
      it("should handle empty session id", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(sut.logout("")).resolves.not.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          "",
        );
      });

      it("should handle null session id", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(sut.logout(null as any)).resolves.not.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          null,
        );
      });

      it("should handle undefined session id", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(sut.logout(undefined as any)).resolves.not.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          undefined,
        );
      });

      it("should handle very long session id", async () => {
        const longSessionId = "a".repeat(1000);
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(sut.logout(longSessionId)).resolves.not.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          longSessionId,
        );
      });

      it("should handle special characters in session id", async () => {
        const specialSessionId = "session-!@#$%^&*()_+{}[]|\\:;\"'<>?,./";
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(sut.logout(specialSessionId)).resolves.not.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          specialSessionId,
        );
      });
    });

    describe("error handling resilience", () => {
      it("should handle any type of error without throwing", async () => {
        const errors = [
          new Error("Generic error"),
          new TypeError("Type error"),
          new ReferenceError("Reference error"),
          new RangeError("Range error"),
          new SyntaxError("Syntax error"),
          "String error",
          { error: "Object error" },
          123,
          null,
          undefined,
        ];

        for (const error of errors) {
          mockSessionRepository.deactivateSession.mockRejectedValueOnce(error);
          await expect(sut.logout(mockSessionId)).resolves.not.toThrow();
        }

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(
          errors.length,
        );
      });

      it("should handle network timeout errors silently", async () => {
        const timeoutError = new Error("Network timeout");
        timeoutError.name = "TimeoutError";
        mockSessionRepository.deactivateSession.mockRejectedValue(timeoutError);

        await expect(sut.logout(mockSessionId)).resolves.not.toThrow();
      });

      it("should handle database constraint errors silently", async () => {
        const constraintError = new Error("Database constraint violation");
        constraintError.name = "ConstraintError";
        mockSessionRepository.deactivateSession.mockRejectedValue(
          constraintError,
        );

        await expect(sut.logout(mockSessionId)).resolves.not.toThrow();
      });
    });

    describe("multiple calls", () => {
      it("should handle multiple logout calls for same session", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await Promise.all([
          sut.logout(mockSessionId),
          sut.logout(mockSessionId),
          sut.logout(mockSessionId),
        ]);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(
          3,
        );
        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
      });

      it("should handle multiple logout calls for different sessions", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        const sessionIds = ["session-1", "session-2", "session-3"];
        await Promise.all(sessionIds.map((id) => sut.logout(id)));

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(
          3,
        );
        sessionIds.forEach((id) => {
          expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
            id,
          );
        });
      });

      it("should handle mixed success and failure scenarios", async () => {
        mockSessionRepository.deactivateSession
          .mockResolvedValueOnce() // First call succeeds
          .mockRejectedValueOnce(new Error("Failed")) // Second call fails
          .mockResolvedValueOnce(); // Third call succeeds

        const results = await Promise.all([
          sut.logout("session-1"),
          sut.logout("session-2"),
          sut.logout("session-3"),
        ]);

        expect(results).toEqual([undefined, undefined, undefined]);
        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(
          3,
        );
      });
    });

    describe("performance characteristics", () => {
      it("should complete quickly even with repository errors", async () => {
        mockSessionRepository.deactivateSession.mockRejectedValue(
          new Error("Slow error"),
        );

        const startTime = Date.now();
        await sut.logout(mockSessionId);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      });

      it("should not leak memory on repeated errors", async () => {
        mockSessionRepository.deactivateSession.mockRejectedValue(
          new Error("Repeated error"),
        );

        // Simulate many logout attempts
        const promises = Array.from({ length: 100 }, () =>
          sut.logout(mockSessionId),
        );
        await Promise.all(promises);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(
          100,
        );
      });
    });

    describe("method behavior verification", () => {
      it("should only call deactivateSession method", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledTimes(
          1,
        );
        expect(mockSessionRepository.create).not.toHaveBeenCalled();
        expect(mockSessionRepository.findByToken).not.toHaveBeenCalled();
        expect(mockSessionRepository.findByRefreshToken).not.toHaveBeenCalled();
        expect(mockSessionRepository.updateToken).not.toHaveBeenCalled();
        expect(mockSessionRepository.updateRefreshToken).not.toHaveBeenCalled();
        expect(
          mockSessionRepository.deactivateAllUserSessions,
        ).not.toHaveBeenCalled();
      });

      it("should pass session id exactly as received", async () => {
        const sessionIds = [
          "normal-session-123",
          "",
          " ",
          "session with spaces",
          "session\nwith\nnewlines",
          "session\twith\ttabs",
        ];

        mockSessionRepository.deactivateSession.mockResolvedValue();

        for (const sessionId of sessionIds) {
          await sut.logout(sessionId);
          expect(
            mockSessionRepository.deactivateSession,
          ).toHaveBeenLastCalledWith(sessionId);
        }
      });
    });

    describe("silent fail behavior verification", () => {
      it("should demonstrate silent fail philosophy", async () => {
        // The logout operation should succeed from the client's perspective
        // even if the underlying operation fails
        mockSessionRepository.deactivateSession.mockRejectedValue(
          new Error("Any error"),
        );

        // No error should be thrown - logout appears successful
        const result = await sut.logout(mockSessionId);

        expect(result).toBeUndefined(); // Successful logout returns void
        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
      });

      it("should not expose repository implementation details", async () => {
        const repositoryError = new Error(
          "Internal database constraint violation",
        );
        mockSessionRepository.deactivateSession.mockRejectedValue(
          repositoryError,
        );

        // Client should not see internal repository errors
        await expect(sut.logout(mockSessionId)).resolves.not.toThrow();
      });
    });

    describe("security logging", () => {
      const mockUserId = "user-123";

      beforeEach(() => {
        // Clear previous mock calls
        mockSecurityLogger.logLogout.mockClear();
      });

      it("should log logout when userId is provided", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId, mockUserId);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).toHaveBeenCalledWith(mockUserId);
        expect(mockSecurityLogger.logLogout).toHaveBeenCalledTimes(1);
      });

      it("should log logout when userId is provided without request", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId, mockUserId);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).toHaveBeenCalledWith(mockUserId);
        expect(mockSecurityLogger.logLogout).toHaveBeenCalledTimes(1);
      });

      it("should not log logout when userId is not provided", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).not.toHaveBeenCalled();
      });

      it("should not log logout when userId is empty string", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId, "");

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).not.toHaveBeenCalled();
      });

      it("should not log logout when userId is null", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId, null as any);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).not.toHaveBeenCalled();
      });

      it("should not log logout when userId is undefined", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await sut.logout(mockSessionId, undefined);

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).not.toHaveBeenCalled();
      });

      it("should NOT log logout when repository operation fails", async () => {
        mockSessionRepository.deactivateSession.mockRejectedValue(
          new Error("Repository error"),
        );

        await sut.logout(mockSessionId, mockUserId);

        // Repository was called but failed
        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );

        // Logging should NOT happen since the logout operation failed
        expect(mockSecurityLogger.logLogout).not.toHaveBeenCalled();
      });

      it("should handle logging errors gracefully", async () => {
        mockSessionRepository.deactivateSession.mockResolvedValue();
        mockSecurityLogger.logLogout.mockImplementation(() => {
          throw new Error("Logging error");
        });

        // Should not throw even if logging fails
        await expect(
          sut.logout(mockSessionId, mockUserId),
        ).resolves.not.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockSessionId,
        );
        expect(mockSecurityLogger.logLogout).toHaveBeenCalledWith(mockUserId);
      });
    });
  });
});
