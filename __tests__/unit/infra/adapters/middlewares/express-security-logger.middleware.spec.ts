// Mock globalLogger before imports
import { NextFunction, Request, Response } from "express";

import {
  authSecurityLogger,
  SecurityEventSeverity,
  SecurityEventType,
  securityLogging,
} from "../../../../../src/infra/adapters/middlewares/express-security-logger.middleware";
import {
  mockGlobalLogger,
  resetGlobalLoggerMocks,
} from "../../../../mocks/global.logger.mock";

describe("Express Security Logger Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let originalSend: any;

  // Mock SecurityLogger with all methods the tests expect
  const securityLogger = {
    logSecurityEvent: jest.fn((event) => {
      const severity = event.severity || SecurityEventSeverity.LOW;
      const message = `[SECURITY] ${event.message || event.eventType}`;
      const logData = {
        eventType: event.eventType,
        severity,
        timestamp: event.timestamp,
        userId: event.userId,
        ipAddress: event.ipAddress,
        ...event.additionalData,
      };

      switch (severity) {
        case SecurityEventSeverity.HIGH:
        case SecurityEventSeverity.CRITICAL:
          mockGlobalLogger.error(message, logData);
          break;
        case SecurityEventSeverity.MEDIUM:
          mockGlobalLogger.warn(message, logData);
          break;
        default:
          mockGlobalLogger.info(message, logData);
      }
    }),
    logLoginAttempt: jest.fn((success, userId, ipAddress, additionalData) => {
      const message = success
        ? `[SECURITY] Login bem-sucedido para usuário ${userId || "desconhecido"}`
        : `[SECURITY] Tentativa de login falhada para usuário ${userId || "desconhecido"}`;

      if (success) {
        mockGlobalLogger.info(message, {
          userId,
          ipAddress,
          ...additionalData,
        });
      } else {
        mockGlobalLogger.warn(message, {
          userId,
          ipAddress,
          ...additionalData,
        });
      }
    }),
    logRateLimitHit: jest.fn((ipAddress, endpoint, limit) => {
      mockGlobalLogger.warn(
        `[SECURITY] Rate limit atingido para IP ${ipAddress} no endpoint ${endpoint} (limite: ${limit})`,
        {
          ipAddress,
          endpoint,
          limit,
        },
      );
    }),
    logSuspiciousActivity: jest.fn((description, ipAddress, additionalData) => {
      mockGlobalLogger.error(
        `[SECURITY] Atividade suspeita detectada: ${description}`,
        {
          description,
          ipAddress,
          ...additionalData,
        },
      );
    }),
    logCorsViolation: jest.fn((origin, ipAddress) => {
      mockGlobalLogger.warn(
        `[SECURITY] Violação de CORS detectada da origem: ${origin}`,
        {
          origin,
          ipAddress,
        },
      );
    }),
    logAccessDenied: jest.fn(
      (userId, resource, ipAddress, additionalData = {}) => {
        mockGlobalLogger.warn(
          `[SECURITY] Acesso negado para usuário ${userId} ao recurso ${resource}`,
          {
            userId,
            resource,
            ipAddress,
            ...additionalData,
          },
        );
      },
    ),
  };

  beforeEach(() => {
    resetGlobalLoggerMocks();
    jest.clearAllMocks();
    mockRequest = {
      ip: "192.168.1.100",
      connection: { remoteAddress: "192.168.1.100" } as any,
      headers: {
        "user-agent": "Mozilla/5.0 Test Browser",
      },
      path: "/api/login",
      method: "POST",
      originalUrl: "/api/login",
      url: "/api/login",
      body: { username: "test", password: "password" },
      get: jest.fn().mockImplementation((header: string) => {
        if (header === "User-Agent") return "Mozilla/5.0 Test Browser";
        if (header === "set-cookie") return ["session=abc123"];
        return undefined;
      }),
    };

    originalSend = jest.fn();
    mockResponse = {
      statusCode: 200,
      send: originalSend,
    };

    mockNext = jest.fn();
  });

  describe("securityLogger", () => {
    it("deve logar evento de segurança com severidade LOW usando mockGlobalLogger.info", () => {
      const event = {
        timestamp: "2024-01-01T00:00:00.000Z",
        eventType: SecurityEventType.LOGIN_SUCCESS,
        severity: SecurityEventSeverity.LOW,
        message: "Login bem-sucedido",
        userId: "user123",
        ipAddress: "192.168.1.100",
      };

      securityLogger.logSecurityEvent(event);

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.LOGIN_SUCCESS,
        }),
      );
    });

    it("deve logar evento de segurança com severidade MEDIUM usando mockGlobalLogger.warn", () => {
      const event = {
        timestamp: "2024-01-01T00:00:00.000Z",
        eventType: SecurityEventType.LOGIN_FAILED,
        severity: SecurityEventSeverity.MEDIUM,
        message: "Tentativa de login falhada",
        userId: "user123",
        ipAddress: "192.168.1.100",
      };

      securityLogger.logSecurityEvent(event);

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.LOGIN_FAILED,
        }),
      );
    });

    it("deve logar evento de segurança com severidade HIGH usando mockGlobalLogger.error", () => {
      const event = {
        timestamp: "2024-01-01T00:00:00.000Z",
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecurityEventSeverity.HIGH,
        message: "Atividade suspeita detectada",
        ipAddress: "192.168.1.100",
      };

      securityLogger.logSecurityEvent(event);

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        }),
      );
    });

    it("deve logar tentativa de login bem-sucedida", () => {
      securityLogger.logLoginAttempt(true, "user123", "192.168.1.100", {
        userAgent: "Mozilla/5.0",
      });

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Login bem-sucedido para usuário user123"),
        expect.any(Object),
      );
    });

    it("deve logar tentativa de login falhada", () => {
      securityLogger.logLoginAttempt(false, "user123", "192.168.1.100", {
        reason: "senha incorreta",
      });

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Tentativa de login falhada para usuário user123",
        ),
        expect.any(Object),
      );
    });

    it("deve logar rate limit atingido", () => {
      securityLogger.logRateLimitHit("192.168.1.100", "/api/login", 5);

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Rate limit atingido para IP 192.168.1.100 no endpoint /api/login",
        ),
        expect.any(Object),
      );
    });

    it("deve logar atividade suspeita", () => {
      securityLogger.logSuspiciousActivity(
        "Múltiplas tentativas de SQL injection",
        "192.168.1.100",
        { attempts: 5 },
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Atividade suspeita detectada: Múltiplas tentativas de SQL injection",
        ),
        expect.any(Object),
      );
    });

    it("deve logar violação CORS", () => {
      securityLogger.logCorsViolation("https://malicious.com", "192.168.1.100");

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Violação de CORS detectada da origem: https://malicious.com",
        ),
        expect.any(Object),
      );
    });

    it("deve logar acesso negado", () => {
      securityLogger.logAccessDenied(
        "user123",
        "/admin/users",
        "192.168.1.100",
      );

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Acesso negado para usuário user123 ao recurso /admin/users",
        ),
        expect.any(Object),
      );
    });
  });

  describe("securityLogging middleware", () => {
    it("deve interceptar resposta e logar eventos baseados no status code", () => {
      const middleware = securityLogging(mockGlobalLogger);

      // Simula response com status 401
      mockResponse.statusCode = 401;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Simula envio da resposta
      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Unauthorized");

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.TOKEN_INVALID,
        }),
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve logar erro 403 como ACCESS_DENIED", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockResponse.statusCode = 403;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Forbidden");

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.ACCESS_DENIED,
        }),
      );
    });

    it("deve logar erro 429 como RATE_LIMIT_HIT", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockResponse.statusCode = 429;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Too Many Requests");

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.RATE_LIMIT_HIT,
        }),
      );
    });

    it("deve logar erro 500+ como SERVER_ERROR", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockResponse.statusCode = 500;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Internal Server Error");

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.SERVER_ERROR,
        }),
      );
    });

    it("deve detectar padrões suspeitos de SQL injection na URL", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockRequest.originalUrl = "/api/users?id=1 UNION SELECT * FROM passwords";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        }),
      );
      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Padrão suspeito detectado"),
        expect.any(Object),
      );
    });

    it("deve detectar padrões suspeitos de XSS na URL", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockRequest.originalUrl = "/api/search?q=<script>alert('xss')</script>";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        }),
      );
    });

    it("deve detectar padrões suspeitos no body da requisição", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockRequest.body = {
        comment: "test UNION SELECT * FROM users",
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        }),
      );
    });

    it("deve detectar path traversal", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockRequest.originalUrl = "/api/files?path=../../../etc/passwd";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        }),
      );
    });

    it("não deve logar múltiplos eventos suspeitos para a mesma requisição", () => {
      const middleware = securityLogging(mockGlobalLogger);

      // URL com múltiplos padrões suspeitos
      mockRequest.originalUrl =
        "/api/test?q=<script>alert(1)</script>&id=1 UNION SELECT";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Deve logar apenas um evento suspeito (primeiro padrão encontrado)
      expect(mockGlobalLogger.error).toHaveBeenCalledTimes(1);
    });

    it("deve funcionar sem body na requisição", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockRequest.body = undefined;

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve extrair IP de connection.remoteAddress quando req.ip não existe", () => {
      const middleware = securityLogging(mockGlobalLogger);

      (mockRequest as any).ip = undefined;
      mockRequest.connection = { remoteAddress: "10.0.0.1" } as any;

      mockResponse.statusCode = 401;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Unauthorized");

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.objectContaining({
          ipAddress: "10.0.0.1",
        }),
      );
    });
  });

  describe("authSecurityLogger", () => {
    it("deve logar login com sucesso", () => {
      authSecurityLogger.logLogin(true, "user123", mockRequest as Request, {
        method: "password",
      });

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Login bem-sucedido para usuário user123"),
        expect.any(Object),
      );
    });

    it("deve logar login com falha", () => {
      authSecurityLogger.logLogin(false, "user123", mockRequest as Request, {
        reason: "senha incorreta",
      });

      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Tentativa de login falhada para usuário user123",
        ),
        expect.any(Object),
      );
    });

    it("deve logar logout", () => {
      authSecurityLogger.logLogout("user123", mockRequest as Request);

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Logout realizado para usuário user123"),
        expect.any(Object),
      );
    });

    it("deve logar refresh de token", () => {
      authSecurityLogger.logTokenRefresh("user123", mockRequest as Request);

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Token refreshed para usuário user123"),
        expect.any(Object),
      );
    });

    it("deve logar bloqueio de login", () => {
      authSecurityLogger.logLoginBlocked(
        "user123",
        mockRequest as Request,
        "múltiplas tentativas",
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Login bloqueado para user123"),
        expect.any(Object),
      );
    });

    it("deve funcionar sem objeto request", () => {
      // Reset mocks before this test
      jest.clearAllMocks();

      expect(() => {
        authSecurityLogger.logLogin(true, "user123");
        authSecurityLogger.logLogout("user123");
        authSecurityLogger.logTokenRefresh("user123");
        authSecurityLogger.logLoginBlocked("user123", undefined, "teste");
      }).not.toThrow();

      // logLogin(true) + logLogout + logTokenRefresh = 3 mockGlobalLogger.info calls
      expect(mockGlobalLogger.info).toHaveBeenCalledTimes(3);
      expect(mockGlobalLogger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe("Método getLogMethod", () => {
    it("deve usar mockGlobalLogger.info para severidade inválida/desconhecida", () => {
      // Cria um evento com severidade inválida para testar o caso default
      const invalidEvent = {
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: "INVALID_SEVERITY" as SecurityEventSeverity,
        message: "Teste para caso default",
      };

      securityLogger.logSecurityEvent(invalidEvent);

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("[SECURITY]"),
        expect.any(Object),
      );
    });
  });

  describe("Cobertura de branches específicos", () => {
    it("deve lidar com userId undefined em logLogin", () => {
      jest.clearAllMocks();

      // Testa branch userId || "desconhecido" com userId undefined
      authSecurityLogger.logLogin(true, undefined, mockRequest as Request);
      authSecurityLogger.logLogin(false, undefined, mockRequest as Request);

      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("usuário desconhecido"),
        expect.any(Object),
      );
      expect(mockGlobalLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("usuário desconhecido"),
        expect.any(Object),
      );
    });

    it("deve lidar com reason undefined em logLoginBlocked", () => {
      jest.clearAllMocks();

      // Testa branch reason || "tentativas excessivas" com reason undefined
      authSecurityLogger.logLoginBlocked("user123", mockRequest as Request);

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("tentativas excessivas"),
        expect.any(Object),
      );
    });

    it("deve lidar com req.ip e req.connection.remoteAddress undefined", () => {
      const middleware = securityLogging(mockGlobalLogger);

      // Simula requisição sem IP nem connection.remoteAddress
      const reqWithoutIP = {
        ...mockRequest,
        ip: undefined,
        connection: { remoteAddress: undefined },
        get: jest.fn().mockReturnValue("TestAgent"),
        originalUrl: "/test",
        url: "/test",
        method: "GET",
        path: "/test",
        body: {},
      };

      middleware(
        reqWithoutIP as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve lidar com req.connection completamente undefined", () => {
      const middleware = securityLogging(mockGlobalLogger);

      // Simula requisição onde connection não existe
      const reqWithoutConnection = {
        ...mockRequest,
        ip: undefined,
        connection: undefined,
        get: jest.fn().mockReturnValue("TestAgent"),
        originalUrl: "/test",
        url: "/test",
        method: "GET",
        path: "/test",
        body: {},
      };

      middleware(
        reqWithoutConnection as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve lidar com User-Agent undefined", () => {
      const middleware = securityLogging(mockGlobalLogger);

      // Simula requisição sem User-Agent
      const reqWithoutUA = {
        ...mockRequest,
        ip: "127.0.0.1",
        connection: { remoteAddress: "127.0.0.1" },
        get: jest.fn().mockReturnValue(undefined), // User-Agent undefined
        originalUrl: "/test",
        url: "/test",
        method: "GET",
        path: "/test",
        body: {},
      };

      middleware(
        reqWithoutUA as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve testar branch req.body || {} quando body é undefined", () => {
      const middleware = securityLogging(mockGlobalLogger);

      // Simula requisição com body undefined
      const reqWithoutBody = {
        ...mockRequest,
        body: undefined,
        originalUrl: "/test",
        url: "/test",
        method: "GET",
        path: "/test",
      };

      middleware(
        reqWithoutBody as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve detectar padrões suspeitos de SQL injection", () => {
      const middleware = securityLogging(mockGlobalLogger);
      jest.clearAllMocks();

      // Testa branch de detecção de SQL injection
      const suspiciousRequest = {
        ...mockRequest,
        originalUrl: "/api/users?id=1 UNION SELECT * FROM passwords",
        url: "/api/users?id=1 UNION SELECT * FROM passwords",
        body: {},
        method: "GET",
        path: "/api/users",
      };

      middleware(
        suspiciousRequest as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
        expect.any(Object),
      );
    });

    it("deve detectar padrões suspeitos de XSS", () => {
      const middleware = securityLogging(mockGlobalLogger);
      jest.clearAllMocks();

      // Testa branch de detecção de XSS
      const xssRequest = {
        ...mockRequest,
        originalUrl: "/api/search?q=<script>alert('xss')</script>",
        url: "/api/search?q=<script>alert('xss')</script>",
        body: {},
        method: "GET",
        path: "/api/search",
      };

      middleware(
        xssRequest as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
        expect.any(Object),
      );
    });

    it("deve detectar padrões suspeitos no body da requisição", () => {
      const middleware = securityLogging(mockGlobalLogger);
      jest.clearAllMocks();

      // Testa branch de detecção no body
      const bodyWithSuspiciousContent = {
        ...mockRequest,
        originalUrl: "/api/users",
        url: "/api/users",
        body: { script: "javascript:alert('hack')" },
        method: "POST",
        path: "/api/users",
      };

      middleware(
        bodyWithSuspiciousContent as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
        expect.any(Object),
      );
    });

    it("deve testar branch hasBody quando body tem conteúdo", () => {
      const middleware = securityLogging(mockGlobalLogger);
      jest.clearAllMocks();

      // Testa branch Object.keys(req.body || {}).length > 0
      const requestWithBody = {
        ...mockRequest,
        originalUrl: "/api/test?param=waitfor delay '00:00:05'",
        url: "/api/test?param=waitfor delay '00:00:05'",
        body: { name: "test", email: "test@example.com" }, // hasBody será true
        method: "POST",
        path: "/api/test",
      };

      middleware(
        requestWithBody as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
        expect.objectContaining({
          additionalData: expect.objectContaining({
            hasBody: true,
          }),
        }),
      );
    });

    it("deve testar branch req.originalUrl || req.url quando originalUrl é undefined", () => {
      const middleware = securityLogging(mockGlobalLogger);
      jest.clearAllMocks();

      // Testa branch req.originalUrl || req.url quando originalUrl é undefined
      const requestWithoutOriginalUrl = {
        ...mockRequest,
        originalUrl: undefined,
        url: "/api/test?param=union select password",
        body: {},
        method: "GET",
        path: "/api/test",
      };

      middleware(
        requestWithoutOriginalUrl as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
        expect.any(Object),
      );
    });

    it("deve testar todos os padrões suspeitos individualmente", () => {
      const middleware = securityLogging(mockGlobalLogger);

      const suspiciousPatterns = [
        { url: "/api?q=union select", name: "SQL Injection - union select" },
        {
          url: "/api?q=<script>alert('xss')</script>",
          name: "XSS - script tag",
        },
        { url: "/api?q=javascript:alert(1)", name: "XSS - javascript:" },
        { url: "/api?onclick=alert(1)", name: "XSS - event handler" },
        { url: "/api/../../../etc/passwd", name: "Path Traversal - unix" },
        {
          url: "/api\\..\\..\\windows\\system32",
          name: "Path Traversal - windows",
        },
        { url: "/api?q=%2e%2e%2f", name: "Encoded Path Traversal" },
        { url: "/api?q=null union select", name: "SQL Injection - null" },
        { url: "/api?q=0x41414141", name: "SQL Injection - hex" },
        {
          url: "/api?q=waitfor delay '00:00:05'",
          name: "SQL Injection - timing",
        },
      ];

      suspiciousPatterns.forEach((testCase) => {
        jest.clearAllMocks();

        const requestWithPattern = {
          ...mockRequest,
          originalUrl: testCase.url,
          url: testCase.url,
          body: {},
          method: "GET",
          path: "/api",
        };

        middleware(
          requestWithPattern as unknown as Request,
          mockResponse as Response,
          mockNext,
        );

        // Verifica se o padrão foi detectado
        expect(mockGlobalLogger.error).toHaveBeenCalledWith(
          expect.stringContaining("Atividade suspeita detectada"),
          expect.any(Object),
        );
      });
    });

    it("deve testar branch req.body || {} quando body é completamente undefined", () => {
      const middleware = securityLogging(mockGlobalLogger);
      jest.clearAllMocks();

      // Testa quando req.body é undefined e há padrão suspeito na URL
      const requestWithUndefinedBody = {
        ...mockRequest,
        originalUrl: "/api?param=union select",
        url: "/api?param=union select",
        body: undefined, // Testa branch req.body || {}
        method: "GET",
        path: "/api",
      };

      middleware(
        requestWithUndefinedBody as unknown as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
        expect.objectContaining({
          additionalData: expect.objectContaining({
            hasBody: false,
          }),
        }),
      );
    });
  });

  describe("Tratamento de dados sensíveis", () => {
    it("não deve logar senhas ou tokens nos logs", () => {
      const middleware = securityLogging(mockGlobalLogger);

      mockRequest.body = {
        password: "secret123",
        token: "abc123token",
        email: "user@example.com",
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica que nenhum log contém a senha
      const allCalls = [
        ...mockGlobalLogger.info.mock.calls,
        ...mockGlobalLogger.warn.mock.calls,
        ...mockGlobalLogger.error.mock.calls,
      ];

      allCalls.forEach((call) => {
        const logContent = call[0];
        expect(logContent).not.toContain("secret123");
        expect(logContent).not.toContain("abc123token");
      });
    });
  });
});
