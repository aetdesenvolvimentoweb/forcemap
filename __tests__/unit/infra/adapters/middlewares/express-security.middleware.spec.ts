import { NextFunction, Request, Response } from "express";

import {
  securityHeaders,
  SecurityHeadersConfig,
  securityHeadersDev,
  securityHeadersProd,
} from "../../../../../src/infra/adapters/middlewares/express-security.middleware";

describe("Express Security Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let headersSetter: Record<string, string>;
  let headersRemover: string[];

  beforeEach(() => {
    headersSetter = {};
    headersRemover = [];

    mockRequest = {};

    mockResponse = {
      setHeader: jest.fn().mockImplementation((name: string, value: string) => {
        headersSetter[name] = value;
        return mockResponse;
      }),
      removeHeader: jest.fn().mockImplementation((name: string) => {
        headersRemover.push(name);
        return mockResponse;
      }),
    };

    mockNext = jest.fn();
  });

  describe("securityHeaders", () => {
    it("deve aplicar configuração padrão quando nenhuma configuração é fornecida", () => {
      const middleware = securityHeaders();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Strict-Transport-Security"]).toBe(
        "max-age=31536000; includeSubDomains; preload",
      );
      expect(headersSetter["Content-Security-Policy"]).toBe(
        "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'none'; font-src 'none'; object-src 'none'; media-src 'none'; frame-src 'none'",
      );
      expect(headersSetter["X-Frame-Options"]).toBe("DENY");
      expect(headersSetter["X-Content-Type-Options"]).toBe("nosniff");
      expect(headersSetter["X-XSS-Protection"]).toBe("1; mode=block");
      expect(headersSetter["Referrer-Policy"]).toBe(
        "strict-origin-when-cross-origin",
      );
      expect(headersSetter["Permissions-Policy"]).toContain("camera=()");
      expect(headersSetter["Server"]).toBe("API-Server");
      expect(headersRemover).toContain("X-Powered-By");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve aplicar configuração customizada quando fornecida", () => {
      const customConfig: SecurityHeadersConfig = {
        hsts: {
          enabled: true,
          maxAge: 86400,
          includeSubDomains: false,
          preload: false,
        },
        frameOptions: {
          enabled: true,
          value: "SAMEORIGIN",
        },
        hideServerInfo: {
          enabled: true,
          customServerHeader: "Custom-API",
        },
      };

      const middleware = securityHeaders(customConfig);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Strict-Transport-Security"]).toBe("max-age=86400");
      expect(headersSetter["X-Frame-Options"]).toBe("SAMEORIGIN");
      expect(headersSetter["Server"]).toBe("Custom-API");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve desabilitar headers quando configurado", () => {
      const customConfig: SecurityHeadersConfig = {
        hsts: { enabled: false },
        csp: { enabled: false },
        frameOptions: { enabled: false },
        contentTypeOptions: { enabled: false },
        xssProtection: { enabled: false },
        referrerPolicy: { enabled: false },
        permissionsPolicy: { enabled: false },
        hideServerInfo: { enabled: false },
      };

      const middleware = securityHeaders(customConfig);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Strict-Transport-Security"]).toBeUndefined();
      expect(headersSetter["Content-Security-Policy"]).toBeUndefined();
      expect(headersSetter["X-Frame-Options"]).toBeUndefined();
      expect(headersSetter["X-Content-Type-Options"]).toBeUndefined();
      expect(headersSetter["X-XSS-Protection"]).toBeUndefined();
      expect(headersSetter["Referrer-Policy"]).toBeUndefined();
      expect(headersSetter["Permissions-Policy"]).toBeUndefined();
      expect(headersSetter["Server"]).toBeUndefined();
      expect(headersRemover).not.toContain("X-Powered-By");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    describe("HSTS (Strict-Transport-Security)", () => {
      it("deve gerar header HSTS completo com todas as opções", () => {
        const config: SecurityHeadersConfig = {
          hsts: {
            enabled: true,
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Strict-Transport-Security"]).toBe(
          "max-age=31536000; includeSubDomains; preload",
        );
      });

      it("deve gerar header HSTS apenas com maxAge", () => {
        const config: SecurityHeadersConfig = {
          hsts: {
            enabled: true,
            maxAge: 86400,
            includeSubDomains: false,
            preload: false,
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Strict-Transport-Security"]).toBe(
          "max-age=86400",
        );
      });
    });

    describe("CSP (Content-Security-Policy)", () => {
      it("deve gerar CSP com diretivas customizadas", () => {
        const config: SecurityHeadersConfig = {
          csp: {
            enabled: true,
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Content-Security-Policy"]).toBe(
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        );
      });

      it("deve converter camelCase para kebab-case nas diretivas", () => {
        const config: SecurityHeadersConfig = {
          csp: {
            enabled: true,
            directives: {
              defaultSrc: ["'self'"],
              connectSrc: ["'self'"],
              imgSrc: ["'self'"],
            },
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Content-Security-Policy"]).toContain(
          "default-src",
        );
        expect(headersSetter["Content-Security-Policy"]).toContain(
          "connect-src",
        );
        expect(headersSetter["Content-Security-Policy"]).toContain("img-src");
      });

      it("não deve gerar CSP quando diretivas não são fornecidas", () => {
        const config: SecurityHeadersConfig = {
          csp: {
            enabled: true,
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Content-Security-Policy"]).toBeUndefined();
      });

      it("não deve gerar CSP quando diretivas estão undefined", () => {
        const config: SecurityHeadersConfig = {
          csp: {
            enabled: true,
            directives: undefined, // Linha 124 - directives é undefined
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Content-Security-Policy"]).toBeUndefined();
      });

      it("deve forçar cobertura da linha 124 através de configuração específica", () => {
        // Este teste força a execução da linha 124 da função generateCSPValue
        // criando uma configuração que passa o check de enabled e directives
        // mas onde directives pode ser undefined internamente
        const configWithNullDirectives: SecurityHeadersConfig = {
          csp: {
            enabled: true,
            directives: null as any, // Força undefined/null
          },
        };

        const middleware = securityHeaders(configWithNullDirectives);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Content-Security-Policy"]).toBeUndefined();
      });

      it("não deve definir CSP quando generateCSPValue retorna string vazia", () => {
        const config: SecurityHeadersConfig = {
          csp: {
            enabled: true,
            directives: {}, // Objeto vazio resulta em string vazia - Linha 173
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Content-Security-Policy"]).toBeUndefined();
      });
    });

    describe("X-Frame-Options", () => {
      it("deve usar valor customizado quando fornecido", () => {
        const config: SecurityHeadersConfig = {
          frameOptions: {
            enabled: true,
            value: "ALLOW-FROM https://example.com",
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["X-Frame-Options"]).toBe(
          "ALLOW-FROM https://example.com",
        );
      });

      it("deve usar valor padrão DENY quando value não é fornecido", () => {
        const config: SecurityHeadersConfig = {
          frameOptions: {
            enabled: true,
            // value não definido - usa padrão "DENY" - Linha 182
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["X-Frame-Options"]).toBe("DENY");
      });
    });

    describe("X-XSS-Protection", () => {
      it("deve configurar XSS protection sem blocking", () => {
        const config: SecurityHeadersConfig = {
          xssProtection: {
            enabled: true,
            block: false,
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["X-XSS-Protection"]).toBe("1");
      });

      it("deve configurar XSS protection com blocking", () => {
        const config: SecurityHeadersConfig = {
          xssProtection: {
            enabled: true,
            block: true,
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["X-XSS-Protection"]).toBe("1; mode=block");
      });
    });

    describe("Referrer-Policy", () => {
      it("deve usar policy padrão quando não fornecida", () => {
        const config: SecurityHeadersConfig = {
          referrerPolicy: {
            enabled: true,
            // policy não definida - usa padrão - Linha 201
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Referrer-Policy"]).toBe(
          "strict-origin-when-cross-origin",
        );
      });
    });

    describe("Permissions-Policy", () => {
      it("deve gerar policy com features desabilitadas", () => {
        const config: SecurityHeadersConfig = {
          permissionsPolicy: {
            enabled: true,
            directives: {
              camera: [],
              microphone: [],
              geolocation: ["'self'"],
            },
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        const policy = headersSetter["Permissions-Policy"];
        expect(policy).toContain("camera=()");
        expect(policy).toContain("microphone=()");
        expect(policy).toContain("geolocation=(\"'self'\")");
      });

      it("não deve definir Permissions-Policy quando generatePermissionsPolicyValue retorna string vazia", () => {
        const config: SecurityHeadersConfig = {
          permissionsPolicy: {
            enabled: true,
            directives: {}, // Objeto vazio resulta em string vazia - Linha 213
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Permissions-Policy"]).toBeUndefined();
      });
    });

    describe("Server Info Hiding", () => {
      it("deve remover X-Powered-By e não definir Server quando customServerHeader não é fornecido", () => {
        const config: SecurityHeadersConfig = {
          hideServerInfo: {
            enabled: true,
          },
        };

        const middleware = securityHeaders(config);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersRemover).toContain("X-Powered-By");
        expect(headersSetter["Server"]).toBeUndefined();
      });
    });
  });

  describe("securityHeadersDev", () => {
    it("deve aplicar configuração de desenvolvimento", () => {
      const middleware = securityHeadersDev();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Strict-Transport-Security"]).toBeUndefined(); // Desabilitado em dev
      expect(headersSetter["Content-Security-Policy"]).toContain("'self'"); // Mais permissivo
      expect(headersSetter["Content-Security-Policy"]).toContain(
        "'unsafe-inline'",
      );
      expect(headersSetter["X-Frame-Options"]).toBe("SAMEORIGIN"); // Mais permissivo
      expect(headersSetter["Server"]).toBe("API-Dev-Server");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve permitir conexões WebSocket em desenvolvimento", () => {
      const middleware = securityHeadersDev();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Content-Security-Policy"]).toContain("ws:");
      expect(headersSetter["Content-Security-Policy"]).toContain("wss:");
    });

    it("deve permitir data: e blob: para imagens em desenvolvimento", () => {
      const middleware = securityHeadersDev();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Content-Security-Policy"]).toContain("data:");
      expect(headersSetter["Content-Security-Policy"]).toContain("blob:");
    });
  });

  describe("securityHeadersProd", () => {
    it("deve aplicar configuração de produção (restritiva)", () => {
      const middleware = securityHeadersProd();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Strict-Transport-Security"]).toBe(
        "max-age=31536000; includeSubDomains; preload",
      );
      expect(headersSetter["Content-Security-Policy"]).toBe(
        "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'none'; font-src 'none'; object-src 'none'; media-src 'none'; frame-src 'none'",
      );
      expect(headersSetter["X-Frame-Options"]).toBe("DENY");
      expect(headersSetter["Server"]).toBe("API-Server");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve bloquear todas as fontes de conteúdo em produção", () => {
      const middleware = securityHeadersProd();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const csp = headersSetter["Content-Security-Policy"];
      expect(csp).toContain("default-src 'none'");
      expect(csp).toContain("script-src 'none'");
      expect(csp).toContain("style-src 'none'");
      expect(csp).toContain("object-src 'none'");
    });
  });

  describe("Integração e casos extremos", () => {
    it("deve chamar next() mesmo com configuração vazia", () => {
      const middleware = securityHeaders({});

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve funcionar com response mock mínimo", () => {
      const minimalResponse = {
        setHeader: jest.fn().mockReturnThis(),
        removeHeader: jest.fn().mockReturnThis(),
      };

      const middleware = securityHeaders();

      expect(() => {
        middleware(
          mockRequest as Request,
          minimalResponse as unknown as Response,
          mockNext,
        );
      }).not.toThrow();

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve mesclar configuração customizada com configuração padrão", () => {
      const partialConfig: SecurityHeadersConfig = {
        frameOptions: {
          enabled: true,
          value: "SAMEORIGIN",
        },
      };

      const middleware = securityHeaders(partialConfig);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Configuração customizada
      expect(headersSetter["X-Frame-Options"]).toBe("SAMEORIGIN");

      // Configurações padrão mantidas
      expect(headersSetter["X-Content-Type-Options"]).toBe("nosniff");
      expect(headersSetter["Strict-Transport-Security"]).toBe(
        "max-age=31536000; includeSubDomains; preload",
      );
    });

    it("deve processar todas as chamadas setHeader e removeHeader corretamente", () => {
      const middleware = securityHeaders();

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalled();
      expect(mockResponse.removeHeader).toHaveBeenCalledWith("X-Powered-By");

      const setHeaderCalls = (mockResponse.setHeader as jest.Mock).mock.calls;
      expect(setHeaderCalls.length).toBeGreaterThan(5); // Múltiplos headers aplicados
    });
  });
});
