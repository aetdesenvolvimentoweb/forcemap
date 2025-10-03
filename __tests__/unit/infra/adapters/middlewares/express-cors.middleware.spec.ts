import { NextFunction, Request, Response } from "express";

import {
  cors,
  corsAuto,
  CorsConfig,
  corsDev,
  corsProd,
} from "../../../../../src/infra/adapters/middlewares/express-cors.middleware";

describe("Express CORS Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let headersSetter: Record<string, string>;
  // eslint-disable-next-line unused-imports/no-unused-vars
  let responseStatus: number;
  // eslint-disable-next-line unused-imports/no-unused-vars
  let responseBody: any;

  beforeEach(() => {
    headersSetter = {};
    responseStatus = 200;
    responseBody = null;

    mockRequest = {
      headers: {},
      method: "GET",
      originalUrl: "/api/test",
      get path() {
        return this.originalUrl || "/api/test";
      },
    };

    mockResponse = {
      setHeader: jest.fn().mockImplementation((name: string, value: string) => {
        headersSetter[name] = value;
        return mockResponse;
      }),
      status: jest.fn().mockImplementation((code: number) => {
        responseStatus = code;
        return mockResponse;
      }),
      json: jest.fn().mockImplementation((body: any) => {
        responseBody = body;
        return mockResponse;
      }),
      end: jest.fn().mockReturnValue(mockResponse),
    };

    mockNext = jest.fn();

    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("cors", () => {
    it("deve aplicar configuração padrão (origin: false)", () => {
      const middleware = cors();

      mockRequest.headers = { origin: "https://malicious.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
      // Quando origem é bloqueada, outros headers não são definidos
      expect(headersSetter["Access-Control-Allow-Methods"]).toBeUndefined();
      expect(headersSetter["Access-Control-Allow-Headers"]).toBeUndefined();
      expect(headersSetter["Access-Control-Allow-Credentials"]).toBeUndefined();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://malicious.com",
        message: "Esta API não permite requisições de sua origem",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve aplicar todos os headers CORS quando origem é permitida", () => {
      const config: CorsConfig = {
        origin: true, // Permite todas as origens
      };

      const middleware = cors(config);

      mockRequest.headers = {}; // Sem origin header
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe("*");
      expect(headersSetter["Access-Control-Allow-Methods"]).toBe(
        "GET,POST,PUT,DELETE,PATCH",
      );
      expect(headersSetter["Access-Control-Allow-Headers"]).toBe(
        "Content-Type,Authorization,X-Requested-With,Accept,Origin",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve permitir origem específica quando configurada", () => {
      const config: CorsConfig = {
        origin: "https://allowed.com",
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://allowed.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "https://allowed.com",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve bloquear origem não permitida", () => {
      const config: CorsConfig = {
        origin: "https://allowed.com",
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://malicious.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        "🚫 CORS: Origem bloqueada - https://malicious.com tentou acessar /api/test",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://malicious.com",
        message: "Esta API não permite requisições de sua origem",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve permitir múltiplas origens quando configurado com array", () => {
      const config: CorsConfig = {
        origin: ["https://app1.com", "https://app2.com"],
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://app2.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "https://app2.com",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve bloquear origem não listada no array", () => {
      const config: CorsConfig = {
        origin: ["https://app1.com", "https://app2.com"],
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://malicious.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://malicious.com",
        message: "Esta API não permite requisições de sua origem",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve permitir todas as origens quando origin é true", () => {
      const config: CorsConfig = {
        origin: true,
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://any-domain.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Com origin=true e header origin presente, deve retornar o origin específico (mais seguro)
      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "https://any-domain.com",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve usar função customizada para validação de origem", () => {
      const customOriginFunction = jest.fn((origin, callback) => {
        if (origin && origin.includes("trusted")) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      });

      const config: CorsConfig = {
        origin: customOriginFunction,
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://trusted-domain.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(customOriginFunction).toHaveBeenCalledWith(
        "https://trusted-domain.com",
        expect.any(Function),
      );
      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "https://trusted-domain.com",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve configurar credenciais quando especificado", () => {
      const config: CorsConfig = {
        origin: true,
        credentials: true,
      };

      const middleware = cors(config);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Credentials"]).toBe("true");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve configurar maxAge para cache de preflight", () => {
      const config: CorsConfig = {
        origin: true,
        maxAge: 3600,
      };

      const middleware = cors(config);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Max-Age"]).toBe("3600");
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve expor headers customizados", () => {
      const config: CorsConfig = {
        origin: true,
        exposedHeaders: ["X-Total-Count", "X-Custom-Header"],
      };

      const middleware = cors(config);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Expose-Headers"]).toBe(
        "X-Total-Count,X-Custom-Header",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    describe("Requisições OPTIONS (preflight)", () => {
      beforeEach(() => {
        mockRequest.method = "OPTIONS";
      });

      it("deve responder automaticamente a requisições OPTIONS quando preflightContinue é false", () => {
        const config: CorsConfig = {
          origin: true,
          preflightContinue: false,
          optionsSuccessStatus: 204,
        };

        const middleware = cors(config);

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.end).toHaveBeenCalledTimes(1);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("deve continuar para próximo middleware quando preflightContinue é true", () => {
        const config: CorsConfig = {
          origin: true,
          preflightContinue: true,
        };

        const middleware = cors(config);

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.end).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
      });

      it("deve bloquear requisições OPTIONS de origem não permitida", () => {
        const config: CorsConfig = {
          origin: "https://allowed.com",
        };

        const middleware = cors(config);

        mockRequest.headers = { origin: "https://malicious.com" };
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: "CORS: Origem não permitida",
          origin: "https://malicious.com",
          message: "Esta API não permite requisições de sua origem",
        });
      });
    });

    describe("Casos extremos", () => {
      it("deve funcionar sem header origin", () => {
        const config: CorsConfig = {
          origin: true,
        };

        const middleware = cors(config);

        // Sem header origin
        mockRequest.headers = {};
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Access-Control-Allow-Origin"]).toBe("*");
        expect(mockNext).toHaveBeenCalledTimes(1);
      });

      it("deve lidar com função de origem que retorna erro", () => {
        const config: CorsConfig = {
          origin: (origin, callback) => {
            callback(new Error("Erro customizado"), false);
          },
        };

        const middleware = cors(config);

        mockRequest.headers = { origin: "https://test.com" };
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: "CORS: Origem não permitida",
          origin: "https://test.com",
          message: "Esta API não permite requisições de sua origem",
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe("corsDev", () => {
    it("deve aplicar configuração de desenvolvimento", () => {
      // Define env para garantir comportamento consistente
      const originalEnv = process.env.CORS_ALLOW_CREDENTIALS_DEV;
      process.env.CORS_ALLOW_CREDENTIALS_DEV = "true";

      const middleware = corsDev();

      mockRequest.headers = { origin: "http://localhost:3000" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "http://localhost:3000",
      );
      expect(headersSetter["Access-Control-Allow-Credentials"]).toBe("true");
      expect(headersSetter["Access-Control-Allow-Headers"]).toContain(
        "X-CSRF-Token",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Restore
      if (originalEnv !== undefined) {
        process.env.CORS_ALLOW_CREDENTIALS_DEV = originalEnv;
      } else {
        delete process.env.CORS_ALLOW_CREDENTIALS_DEV;
      }
    });

    it("deve bloquear origens não listadas em desenvolvimento", () => {
      const middleware = corsDev();

      mockRequest.headers = { origin: "https://malicious.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://malicious.com",
        message: "Esta API não permite requisições de sua origem",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("corsProd", () => {
    it("deve aplicar configuração de produção (restritiva)", () => {
      const middleware = corsProd();

      // Em produção, usa função que por padrão bloqueia origens não configuradas
      mockRequest.headers = { origin: "https://any-domain.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
      expect(headersSetter["Access-Control-Allow-Credentials"]).toBeUndefined();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://any-domain.com",
        message: "Esta API não permite requisições de sua origem",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve permitir requisições sem origin quando configurado", () => {
      // Define env para permitir requisições sem origin
      const originalEnv = process.env.CORS_ALLOW_NO_ORIGIN_PROD;
      process.env.CORS_ALLOW_NO_ORIGIN_PROD = "true";

      const middleware = corsProd();

      // Sem header origin (comum em apps mobile)
      mockRequest.headers = {};
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);

      // Restore environment
      if (originalEnv !== undefined) {
        process.env.CORS_ALLOW_NO_ORIGIN_PROD = originalEnv;
      } else {
        delete process.env.CORS_ALLOW_NO_ORIGIN_PROD;
      }
    });
  });

  describe("corsAuto", () => {
    it("deve usar configuração de desenvolvimento quando NODE_ENV=development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const middleware = corsAuto();

      mockRequest.headers = { origin: "http://localhost:3000" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "http://localhost:3000",
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("deve usar configuração de produção quando NODE_ENV!=development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const middleware = corsAuto();

      mockRequest.headers = { origin: "https://random-domain.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Configuração via Variáveis de Ambiente", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("deve usar domínios customizados em desenvolvimento via env", () => {
      process.env.NODE_ENV = "development";
      process.env.CORS_ALLOWED_ORIGINS_DEV =
        "http://localhost:4000,http://localhost:5000";
      process.env.CORS_ALLOW_CREDENTIALS_DEV = "false";

      const middleware = corsDev();

      // Testa domínio permitido
      mockRequest.headers = { origin: "http://localhost:4000" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "http://localhost:4000",
      );
      expect(headersSetter["Access-Control-Allow-Credentials"]).toBeUndefined();
    });

    it("deve usar domínios customizados em produção via env", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD =
        "https://meuapp.com,https://admin.meuapp.com";
      process.env.CORS_ALLOW_CREDENTIALS_PROD = "true";

      const middleware = corsProd();

      // Testa domínio permitido
      mockRequest.headers = { origin: "https://meuapp.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "https://meuapp.com",
      );
      expect(headersSetter["Access-Control-Allow-Credentials"]).toBe("true");
    });

    it("deve bloquear domínios não listados na env de produção", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://meuapp.com";

      const middleware = corsProd();

      // Testa domínio não permitido
      mockRequest.headers = { origin: "https://malicious.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "🚫 CORS: Origem bloqueada - https://malicious.com",
        ),
      );
    });

    it("deve permitir requisições sem origin quando configurado", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://meuapp.com";
      process.env.CORS_ALLOW_NO_ORIGIN_PROD = "true";

      const middleware = corsProd();

      // Testa requisição sem origin (mobile app)
      mockRequest.headers = {};
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("deve usar headers customizados via env", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://meuapp.com";
      process.env.CORS_ALLOWED_HEADERS_PROD = "Content-Type,X-Custom-Header";
      process.env.CORS_EXPOSED_HEADERS_PROD = "X-Total-Count";

      const middleware = corsProd();

      mockRequest.headers = { origin: "https://meuapp.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Headers"]).toBe(
        "Content-Type,X-Custom-Header",
      );
      expect(headersSetter["Access-Control-Expose-Headers"]).toBe(
        "X-Total-Count",
      );
    });

    it("deve usar valores padrão quando env não está definida", () => {
      process.env.NODE_ENV = "development";
      delete process.env.CORS_ALLOWED_ORIGINS_DEV;
      delete process.env.CORS_ALLOW_CREDENTIALS_DEV;

      const middleware = corsDev();

      // Deve usar fallback padrão
      mockRequest.headers = { origin: "http://localhost:3000" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "http://localhost:3000",
      );
    });
  });

  describe("Cobertura de branches específicos", () => {
    beforeEach(() => {
      // Limpa todas as variáveis de ambiente
      delete process.env.CORS_ALLOWED_ORIGINS_DEV;
      delete process.env.CORS_ALLOWED_ORIGINS_PROD;
      delete process.env.CORS_ALLOWED_METHODS_PROD;
      delete process.env.CORS_ALLOWED_HEADERS_PROD;
      delete process.env.CORS_EXPOSED_HEADERS_PROD;
    });

    it("deve cobrir linha 95 - requisição sem origin em desenvolvimento", () => {
      process.env.NODE_ENV = "development";
      const middleware = corsDev();

      // Requisição sem header origin (Postman, Insomnia, etc.)
      mockRequest.headers = {}; // Sem origin
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Em desenvolvimento, deve permitir requisições sem origin
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalledWith(403);
    });

    it("deve cobrir linha 149 - parse de métodos customizados em produção", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://example.com";
      process.env.CORS_ALLOWED_METHODS_PROD = " GET , POST , PUT "; // Com espaços para testar trim()

      const middleware = corsProd();

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica se os métodos foram parseados e trimmed corretamente
      expect(headersSetter["Access-Control-Allow-Methods"]).toBe(
        "GET,POST,PUT",
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir linha 192 - caso default do isOriginAllowed", () => {
      // Usa uma configuração CORS inválida para forçar o caso default
      const invalidConfig: CorsConfig = {
        origin: null as any, // Tipo inválido que não é boolean, string, array ou function
      };

      const middleware = cors(invalidConfig);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Deve bloquear por causa do caso default (linha 192)
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://example.com",
        message: "Esta API não permite requisições de sua origem",
      });
    });

    it("deve cobrir headers customizados em produção com trim", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://example.com";
      process.env.CORS_ALLOWED_HEADERS_PROD = " Content-Type , Authorization "; // Com espaços

      const middleware = corsProd();

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica se os headers foram parseados e trimmed corretamente
      expect(headersSetter["Access-Control-Allow-Headers"]).toBe(
        "Content-Type,Authorization",
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir exposed headers customizados em produção com trim", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://example.com";
      process.env.CORS_EXPOSED_HEADERS_PROD = " X-Total-Count , X-Rate-Limit "; // Com espaços

      const middleware = corsProd();

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica se os exposed headers foram parseados e trimmed corretamente
      expect(headersSetter["Access-Control-Expose-Headers"]).toBe(
        "X-Total-Count,X-Rate-Limit",
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir linha 142 - erro em produção para origin não permitida", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://allowed.com";

      const middleware = corsProd();

      mockRequest.headers = { origin: "https://notallowed.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Deve bloquear e retornar erro específico
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://notallowed.com",
        message: "Esta API não permite requisições de sua origem",
      });
    });

    it("deve cobrir linha 183 - isOriginAllowed com array", () => {
      const config: CorsConfig = {
        origin: ["https://app1.com", "https://app2.com"], // Array de origins
      };

      const middleware = cors(config);

      // Testa origin permitida no array
      mockRequest.headers = { origin: "https://app1.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Origin"]).toBe(
        "https://app1.com",
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir tratamento de methods como string única", () => {
      const config: CorsConfig = {
        origin: true,
        methods: "GET,POST", // String ao invés de array
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Methods"]).toBe("GET,POST");
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir tratamento de allowedHeaders como string única", () => {
      const config: CorsConfig = {
        origin: true,
        allowedHeaders: "Content-Type,Authorization", // String ao invés de array
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Allow-Headers"]).toBe(
        "Content-Type,Authorization",
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir tratamento de exposedHeaders como string única", () => {
      const config: CorsConfig = {
        origin: true,
        exposedHeaders: "X-Total-Count,X-Rate-Limit", // String ao invés de array
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Expose-Headers"]).toBe(
        "X-Total-Count,X-Rate-Limit",
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir maxAge quando é zero", () => {
      const config: CorsConfig = {
        origin: true,
        maxAge: 0, // Valor específico que deve ser setado
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(headersSetter["Access-Control-Max-Age"]).toBe("0");
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir preflightContinue = true para OPTIONS", () => {
      const config: CorsConfig = {
        origin: true,
        preflightContinue: true, // Continua ao invés de terminar
      };

      const middleware = cors(config);

      mockRequest.method = "OPTIONS";
      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Deve chamar next() ao invés de terminar a requisição
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.end).not.toHaveBeenCalled();
    });

    it("deve cobrir logging de bloqueio CORS (linhas 211-217)", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const config: CorsConfig = {
        origin: "https://allowed.com", // Origem específica permitida
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://blocked.com" };
      mockRequest.originalUrl = "/api/test";
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica se o console.warn foi chamado com o log correto
      expect(consoleSpy).toHaveBeenCalledWith(
        "🚫 CORS: Origem bloqueada - https://blocked.com tentou acessar /api/test",
      );

      // Verifica se a resposta de erro foi enviada
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "https://blocked.com",
        message: "Esta API não permite requisições de sua origem",
      });

      consoleSpy.mockRestore();
    });

    it("deve cobrir logging quando não há origin (linha 211)", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const config: CorsConfig = {
        origin: false, // Bloqueia todas as origens
      };

      const middleware = cors(config);

      mockRequest.headers = {}; // Sem origin header
      mockRequest.originalUrl = "/api/test";
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Verifica se o console.warn foi chamado com "undefined"
      expect(consoleSpy).toHaveBeenCalledWith(
        "🚫 CORS: Origem bloqueada - undefined tentou acessar /api/test",
      );

      consoleSpy.mockRestore();
    });

    it("deve cobrir branch quando exposedHeaders está vazio (linha 247)", () => {
      const config: CorsConfig = {
        origin: true,
        exposedHeaders: [], // Array vazio - não deve setar header
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Não deve ter setado o header de exposed headers
      expect(headersSetter["Access-Control-Expose-Headers"]).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir cenário sem maxAge definido", () => {
      const config: CorsConfig = {
        origin: true,
        maxAge: undefined, // Sem maxAge - não deve setar o header
      };

      const middleware = cors(config);

      mockRequest.headers = { origin: "https://example.com" };
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Não deve ter setado o header Max-Age
      expect(headersSetter["Access-Control-Max-Age"]).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("deve cobrir erro de callback personalizado (linha 142)", () => {
      process.env.NODE_ENV = "production";
      process.env.CORS_ALLOWED_ORIGINS_PROD = "https://allowed.com";
      process.env.CORS_ALLOW_NO_ORIGIN_PROD = "false";

      const middleware = corsProd();

      // Simula requisição sem origin em produção restritiva
      mockRequest.headers = {}; // Sem origin
      mockRequest.originalUrl = "/api/secure";
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Deve bloquear e logar como "undefined"
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "CORS: Origem não permitida",
        origin: "undefined",
        message: "Esta API não permite requisições de sua origem",
      });
    });
  });
});
