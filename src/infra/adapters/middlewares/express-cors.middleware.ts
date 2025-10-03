import { NextFunction, Request, Response } from "express";

/**
 * Configurações para CORS (Cross-Origin Resource Sharing)
 */
export interface CorsConfig {
  /** Origens permitidas - pode ser string, array ou função */
  origin?:
    | string
    | string[]
    | boolean
    | ((
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => void);
  /** Métodos HTTP permitidos */
  methods?: string | string[];
  /** Headers permitidos nas requisições */
  allowedHeaders?: string | string[];
  /** Headers expostos nas respostas */
  exposedHeaders?: string | string[];
  /** Permite envio de cookies e credenciais */
  credentials?: boolean;
  /** Tempo de cache para requisições preflight (OPTIONS) */
  maxAge?: number;
  /** Se deve responder automaticamente a requisições OPTIONS */
  preflightContinue?: boolean;
  /** Status code para requisições OPTIONS bem-sucedidas */
  optionsSuccessStatus?: number;
}

/**
 * Configuração padrão segura para APIs
 */
const defaultCorsConfig: CorsConfig = {
  origin: false, // Bloqueia todas as origens por padrão (mais seguro)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: [],
  credentials: false, // Não permite cookies por padrão
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Obtém os domínios permitidos a partir das variáveis de ambiente
 */
const getAllowedOrigins = (
  environment: "development" | "production",
): string[] => {
  const envVar =
    environment === "development"
      ? process.env.CORS_ALLOWED_ORIGINS_DEV
      : process.env.CORS_ALLOWED_ORIGINS_PROD;

  if (envVar) {
    // Suporte a múltiplos domínios separados por vírgula
    return envVar
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  // Fallback para valores padrão se não houver variável de ambiente
  if (environment === "development") {
    return [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://localhost:8080", // Para possíveis frontends alternativos
    ];
  }

  // Produção sem fallback - deve ser configurado explicitamente
  return [];
};

/**
 * Configuração para desenvolvimento - mais permissiva
 */
const getDevelopmentCorsConfig = (): CorsConfig => {
  const allowedOrigins = getAllowedOrigins("development");

  return {
    origin: (origin, callback) => {
      // Em desenvolvimento, permite requisições sem origin (Insomnia, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Verifica se o origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-CSRF-Token",
    ],
    exposedHeaders: ["X-Total-Count"],
    credentials: process.env.CORS_ALLOW_CREDENTIALS_DEV === "true", // Configurável via ENV
    maxAge: Number(process.env.CORS_MAX_AGE_DEV) || 86400,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };
};

/**
 * Configuração para produção - restritiva e segura
 */
const getProductionCorsConfig = (): CorsConfig => {
  const allowedOrigins = getAllowedOrigins("production");
  const allowNoOrigin = process.env.CORS_ALLOW_NO_ORIGIN_PROD === "true"; // Para mobile apps/Postman

  return {
    origin: (origin, callback) => {
      // Permite requisições sem origin se configurado (mobile apps, Postman, etc.)
      if (!origin && allowNoOrigin) {
        return callback(null, true);
      }

      // Verifica se o origin está na lista permitida
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `CORS: Origem '${origin || "undefined"}' não permitida em produção`,
          ),
          false,
        );
      }
    },
    methods: process.env.CORS_ALLOWED_METHODS_PROD?.split(",").map((m) =>
      m.trim(),
    ) || ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS_PROD?.split(",").map((h) =>
      h.trim(),
    ) || ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders:
      process.env.CORS_EXPOSED_HEADERS_PROD?.split(",").map((h) => h.trim()) ||
      [],
    credentials: process.env.CORS_ALLOW_CREDENTIALS_PROD === "true",
    maxAge: Number(process.env.CORS_MAX_AGE_PROD) || 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
};

/**
 * Verifica se uma origem está permitida
 */
const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigin: CorsConfig["origin"],
  callback: (err: Error | null, allow?: boolean) => void,
): void => {
  if (typeof allowedOrigin === "boolean") {
    callback(null, allowedOrigin);
    return;
  }

  if (typeof allowedOrigin === "string") {
    callback(null, origin === allowedOrigin);
    return;
  }

  if (Array.isArray(allowedOrigin)) {
    callback(null, allowedOrigin.includes(origin || ""));
    return;
  }

  if (typeof allowedOrigin === "function") {
    allowedOrigin(origin, callback);
    return;
  }

  callback(null, false);
};

/**
 * Middleware CORS customizado para Express
 * Implementa controle de acesso entre origens de forma segura
 */
export const cors = (config: CorsConfig = {}) => {
  const finalConfig = { ...defaultCorsConfig, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;
    const requestMethod = req.method.toUpperCase();

    // Verifica se a origem é permitida
    isOriginAllowed(origin, finalConfig.origin, (err, allowed) => {
      if (err || !allowed) {
        // Log do bloqueio para monitoramento
        console.warn(
          `🚫 CORS: Origem bloqueada - ${origin || "undefined"} tentou acessar ${req.path}`,
        );

        // Bloqueia todas as requisições de origens não permitidas
        res.status(403).json({
          error: "CORS: Origem não permitida",
          origin: origin || "undefined",
          message: "Esta API não permite requisições de sua origem",
        });
        return;
      }

      // Define headers CORS para origens permitidas
      if (origin && allowed) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      } else if (finalConfig.origin === true) {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }

      // Métodos permitidos
      if (finalConfig.methods) {
        const methods = Array.isArray(finalConfig.methods)
          ? finalConfig.methods.join(",")
          : finalConfig.methods;
        res.setHeader("Access-Control-Allow-Methods", methods);
      }

      // Headers permitidos
      if (finalConfig.allowedHeaders) {
        const headers = Array.isArray(finalConfig.allowedHeaders)
          ? finalConfig.allowedHeaders.join(",")
          : finalConfig.allowedHeaders;
        res.setHeader("Access-Control-Allow-Headers", headers);
      }

      // Headers expostos
      if (finalConfig.exposedHeaders && finalConfig.exposedHeaders.length > 0) {
        const exposedHeaders = Array.isArray(finalConfig.exposedHeaders)
          ? finalConfig.exposedHeaders.join(",")
          : finalConfig.exposedHeaders;
        res.setHeader("Access-Control-Expose-Headers", exposedHeaders);
      }

      // Credenciais
      if (finalConfig.credentials) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }

      // Max Age para cache de preflight
      if (finalConfig.maxAge !== undefined) {
        res.setHeader("Access-Control-Max-Age", finalConfig.maxAge.toString());
      }

      // Trata requisições OPTIONS (preflight)
      if (requestMethod === "OPTIONS") {
        if (!finalConfig.preflightContinue) {
          res.status(finalConfig.optionsSuccessStatus || 204).end();
          return;
        }
      }

      next();
    });
  };
};

/**
 * Middleware CORS para desenvolvimento
 * Configuração permissiva para facilitar desenvolvimento local
 */
export const corsDev = () => {
  return cors(getDevelopmentCorsConfig());
};

/**
 * Middleware CORS para produção
 * Configuração restritiva e segura para ambiente de produção
 */
export const corsProd = () => {
  return cors(getProductionCorsConfig());
};

/**
 * Middleware CORS que adapta automaticamente ao ambiente
 */
export const corsAuto = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? corsDev() : corsProd();
};
