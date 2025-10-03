import { NextFunction, Request, Response } from "express";

import {
  authSecurityLogger,
  SecurityEventSeverity,
  SecurityEventType,
  securityLogger,
  securityLogging,
} from "../../../../../src/infra/adapters/middlewares/express-security-logger.middleware";

describe("Express Security Logger Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let originalSend: any;

  beforeEach(() => {
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

    // Mock console methods
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("securityLogger", () => {
    it("deve logar evento de segurança com severidade LOW usando console.info", () => {
      const event = {
        timestamp: "2024-01-01T00:00:00.000Z",
        eventType: SecurityEventType.LOGIN_SUCCESS,
        severity: SecurityEventSeverity.LOW,
        message: "Login bem-sucedido",
        userId: "user123",
        ipAddress: "192.168.1.100",
      };

      securityLogger.logSecurityEvent(event);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("🔒 [SECURITY]"),
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("LOGIN_SUCCESS"),
      );
    });

    it("deve logar evento de segurança com severidade MEDIUM usando console.warn", () => {
      const event = {
        timestamp: "2024-01-01T00:00:00.000Z",
        eventType: SecurityEventType.LOGIN_FAILED,
        severity: SecurityEventSeverity.MEDIUM,
        message: "Tentativa de login falhada",
        userId: "user123",
        ipAddress: "192.168.1.100",
      };

      securityLogger.logSecurityEvent(event);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("🔒 [SECURITY]"),
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("LOGIN_FAILED"),
      );
    });

    it("deve logar evento de segurança com severidade HIGH usando console.error", () => {
      const event = {
        timestamp: "2024-01-01T00:00:00.000Z",
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecurityEventSeverity.HIGH,
        message: "Atividade suspeita detectada",
        ipAddress: "192.168.1.100",
      };

      securityLogger.logSecurityEvent(event);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("🔒 [SECURITY]"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("SUSPICIOUS_ACTIVITY"),
      );
    });

    it("deve logar tentativa de login bem-sucedida", () => {
      securityLogger.logLoginAttempt(true, "user123", "192.168.1.100", {
        userAgent: "Mozilla/5.0",
      });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("Login bem-sucedido para usuário user123"),
      );
    });

    it("deve logar tentativa de login falhada", () => {
      securityLogger.logLoginAttempt(false, "user123", "192.168.1.100", {
        reason: "senha incorreta",
      });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Tentativa de login falhada para usuário user123",
        ),
      );
    });

    it("deve logar rate limit atingido", () => {
      securityLogger.logRateLimitHit("192.168.1.100", "/api/login", 5);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Rate limit atingido para IP 192.168.1.100 no endpoint /api/login",
        ),
      );
    });

    it("deve logar atividade suspeita", () => {
      securityLogger.logSuspiciousActivity(
        "Múltiplas tentativas de SQL injection",
        "192.168.1.100",
        { attempts: 5 },
      );

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Atividade suspeita detectada: Múltiplas tentativas de SQL injection",
        ),
      );
    });

    it("deve logar violação CORS", () => {
      securityLogger.logCorsViolation("https://malicious.com", "192.168.1.100");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Violação CORS detectada da origem: https://malicious.com",
        ),
      );
    });

    it("deve logar acesso negado", () => {
      securityLogger.logAccessDenied(
        "user123",
        "/admin/users",
        "192.168.1.100",
      );

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Acesso negado para usuário user123 ao recurso /admin/users",
        ),
      );
    });
  });

  describe("securityLogging middleware", () => {
    it("deve interceptar resposta e logar eventos baseados no status code", () => {
      const middleware = securityLogging();

      // Simula response com status 401
      mockResponse.statusCode = 401;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Simula envio da resposta
      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Unauthorized");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("TOKEN_INVALID"),
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve logar erro 403 como ACCESS_DENIED", () => {
      const middleware = securityLogging();

      mockResponse.statusCode = 403;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Forbidden");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("ACCESS_DENIED"),
      );
    });

    it("deve logar erro 429 como RATE_LIMIT_HIT", () => {
      const middleware = securityLogging();

      mockResponse.statusCode = 429;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Too Many Requests");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("RATE_LIMIT_HIT"),
      );
    });

    it("deve logar erro 500+ como SERVER_ERROR", () => {
      const middleware = securityLogging();

      mockResponse.statusCode = 500;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Internal Server Error");

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("SERVER_ERROR"),
      );
    });

    it("deve detectar padrões suspeitos de SQL injection na URL", () => {
      const middleware = securityLogging();

      mockRequest.originalUrl = "/api/users?id=1 UNION SELECT * FROM passwords";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("SUSPICIOUS_ACTIVITY"),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Padrão suspeito detectado"),
      );
    });

    it("deve detectar padrões suspeitos de XSS na URL", () => {
      const middleware = securityLogging();

      mockRequest.originalUrl = "/api/search?q=<script>alert('xss')</script>";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("SUSPICIOUS_ACTIVITY"),
      );
    });

    it("deve detectar padrões suspeitos no body da requisição", () => {
      const middleware = securityLogging();

      mockRequest.body = {
        comment: "test UNION SELECT * FROM users",
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("SUSPICIOUS_ACTIVITY"),
      );
    });

    it("deve detectar path traversal", () => {
      const middleware = securityLogging();

      mockRequest.originalUrl = "/api/files?path=../../../etc/passwd";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("SUSPICIOUS_ACTIVITY"),
      );
    });

    it("não deve logar múltiplos eventos suspeitos para a mesma requisição", () => {
      const middleware = securityLogging();

      // URL com múltiplos padrões suspeitos
      mockRequest.originalUrl =
        "/api/test?q=<script>alert(1)</script>&id=1 UNION SELECT";

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Deve logar apenas um evento suspeito (primeiro padrão encontrado)
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("deve funcionar sem body na requisição", () => {
      const middleware = securityLogging();

      mockRequest.body = undefined;

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve extrair IP de connection.remoteAddress quando req.ip não existe", () => {
      const middleware = securityLogging();

      (mockRequest as any).ip = undefined;
      mockRequest.connection = { remoteAddress: "10.0.0.1" } as any;

      mockResponse.statusCode = 401;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const interceptedSend = mockResponse.send as jest.Mock;
      interceptedSend("Unauthorized");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("10.0.0.1"),
      );
    });
  });

  describe("authSecurityLogger", () => {
    it("deve logar login com sucesso", () => {
      authSecurityLogger.logLogin(true, "user123", mockRequest as Request, {
        method: "password",
      });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("Login bem-sucedido para usuário user123"),
      );
    });

    it("deve logar login com falha", () => {
      authSecurityLogger.logLogin(false, "user123", mockRequest as Request, {
        reason: "senha incorreta",
      });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Tentativa de login falhada para usuário user123",
        ),
      );
    });

    it("deve logar logout", () => {
      authSecurityLogger.logLogout("user123", mockRequest as Request);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("Logout realizado para usuário user123"),
      );
    });

    it("deve logar refresh de token", () => {
      authSecurityLogger.logTokenRefresh("user123", mockRequest as Request);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("Token refreshed para usuário user123"),
      );
    });

    it("deve logar bloqueio de login", () => {
      authSecurityLogger.logLoginBlocked(
        "user123",
        mockRequest as Request,
        "múltiplas tentativas",
      );

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Login bloqueado para user123"),
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

      // logLogin(true) + logLogout + logTokenRefresh = 3 console.info calls
      expect(console.info).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe("Método getLogMethod", () => {
    it("deve usar console.log para severidade inválida/desconhecida", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      // Cria um evento com severidade inválida para testar o caso default
      const invalidEvent = {
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: "INVALID_SEVERITY" as SecurityEventSeverity,
        message: "Teste para caso default",
      };

      securityLogger.logSecurityEvent(invalidEvent);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("🔒 [SECURITY]"),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe("Cobertura de branches específicos", () => {
    it("deve lidar com userId undefined em logLogin", () => {
      jest.clearAllMocks();

      // Testa branch userId || "desconhecido" com userId undefined
      authSecurityLogger.logLogin(true, undefined, mockRequest as Request);
      authSecurityLogger.logLogin(false, undefined, mockRequest as Request);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("usuário desconhecido"),
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("usuário desconhecido"),
      );
    });

    it("deve lidar com reason undefined em logLoginBlocked", () => {
      jest.clearAllMocks();

      // Testa branch reason || "tentativas excessivas" com reason undefined
      authSecurityLogger.logLoginBlocked("user123", mockRequest as Request);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("tentativas excessivas"),
      );
    });

    it("deve lidar com req.ip e req.connection.remoteAddress undefined", () => {
      const middleware = securityLogging();

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
      const middleware = securityLogging();

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
      const middleware = securityLogging();

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
      const middleware = securityLogging();

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
      const middleware = securityLogging();
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

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
      );
    });

    it("deve detectar padrões suspeitos de XSS", () => {
      const middleware = securityLogging();
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

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
      );
    });

    it("deve detectar padrões suspeitos no body da requisição", () => {
      const middleware = securityLogging();
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

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
      );
    });

    it("deve testar branch hasBody quando body tem conteúdo", () => {
      const middleware = securityLogging();
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

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("hasBody"),
      );
    });

    it("deve testar branch req.originalUrl || req.url quando originalUrl é undefined", () => {
      const middleware = securityLogging();
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

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Atividade suspeita detectada"),
      );
    });

    it("deve testar todos os padrões suspeitos individualmente", () => {
      const middleware = securityLogging();

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
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining("Atividade suspeita detectada"),
        );
      });
    });

    it("deve testar branch req.body || {} quando body é completamente undefined", () => {
      const middleware = securityLogging();
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

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("hasBody"),
      );
    });
  });

  describe("Tratamento de dados sensíveis", () => {
    it("não deve logar senhas ou tokens nos logs", () => {
      const middleware = securityLogging();

      mockRequest.body = {
        password: "secret123",
        token: "abc123token",
        email: "user@example.com",
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica que nenhum log contém a senha
      const allCalls = [
        ...(console.info as jest.Mock).mock.calls,
        ...(console.warn as jest.Mock).mock.calls,
        ...(console.error as jest.Mock).mock.calls,
        ...(console.log as jest.Mock).mock.calls,
      ];

      allCalls.forEach((call) => {
        const logContent = call[0];
        expect(logContent).not.toContain("secret123");
        expect(logContent).not.toContain("abc123token");
      });
    });
  });
});
