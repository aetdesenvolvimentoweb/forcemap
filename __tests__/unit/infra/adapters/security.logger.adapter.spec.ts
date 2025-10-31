import {
  LoggerProtocol,
  SecurityLoggerProtocol,
} from "../../../../src/application/protocols";
import { SecurityLoggerAdapter } from "../../../../src/infra/adapters/security.logger.adapter";

describe("SecurityLoggerAdapter", () => {
  let sut: SecurityLoggerProtocol;
  let mockLogger: jest.Mocked<LoggerProtocol>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    sut = new SecurityLoggerAdapter(mockLogger);
  });

  describe("logLogin()", () => {
    it("should log successful login using logger.info", () => {
      const userId = "user-123";
      const sessionId = "session-456";
      const metadata = { ipAddress: "192.168.1.1" };

      sut.logLogin(true, userId, sessionId, metadata);

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Login bem-sucedido"),
        expect.any(Object),
      );
    });

    it("should log failed login using logger.warn", () => {
      const userId = "user-123";

      sut.logLogin(false, userId);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Tentativa de login falhada"),
        expect.any(Object),
      );
    });
  });

  describe("logLoginBlocked()", () => {
    it("should log blocked login using logger.error", () => {
      const identifier = "user-123";
      const sessionId = "session-456";
      const reason = "Too many attempts";

      sut.logLoginBlocked(identifier, sessionId, reason);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Login bloqueado"),
        expect.any(Object),
      );
    });
  });

  describe("logLogout()", () => {
    it("should log logout using logger.info", () => {
      const userId = "user-123";

      sut.logLogout(userId);

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Logout realizado"),
        expect.any(Object),
      );
    });
  });

  describe("logTokenRefresh()", () => {
    it("should log token refresh using logger.info", () => {
      const userId = "user-123";

      sut.logTokenRefresh(userId);

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Token refreshed"),
        expect.any(Object),
      );
    });
  });

  describe("logAccessDenied()", () => {
    it("should log access denied using logger.warn", () => {
      const userId = "user-123";
      const resource = "/admin/users";
      const reason = "Insufficient permissions";

      sut.logAccessDenied(userId, resource, reason);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Tentativa de login falhada"),
        expect.any(Object),
      );
    });
  });

  describe("logSuspiciousActivity()", () => {
    it("should log suspicious activity using logger.warn", () => {
      const identifier = "192.168.1.1";
      const activityType = "SQL_INJECTION";
      const details = { pattern: "UNION SELECT" };

      sut.logSuspiciousActivity(identifier, activityType, details);

      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Tentativa de login falhada"),
        expect.any(Object),
      );
    });
  });

  describe("constructor", () => {
    it("should create instance with logger", () => {
      const adapter = new SecurityLoggerAdapter(mockLogger);
      expect(adapter).toBeInstanceOf(SecurityLoggerAdapter);
    });

    it("should implement SecurityLoggerProtocol", () => {
      const adapter: SecurityLoggerProtocol = new SecurityLoggerAdapter(
        mockLogger,
      );
      expect(adapter.logLogin).toBeDefined();
      expect(adapter.logLoginBlocked).toBeDefined();
      expect(adapter.logLogout).toBeDefined();
      expect(adapter.logTokenRefresh).toBeDefined();
      expect(adapter.logAccessDenied).toBeDefined();
      expect(adapter.logSuspiciousActivity).toBeDefined();
    });
  });
});
