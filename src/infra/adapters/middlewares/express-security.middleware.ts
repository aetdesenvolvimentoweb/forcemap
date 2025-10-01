import { NextFunction, Request, Response } from "express";

/**
 * Configurações de segurança para headers HTTP
 */
export interface SecurityHeadersConfig {
  /** Habilitar Strict Transport Security (HSTS) */
  hsts?: {
    enabled: boolean;
    maxAge?: number; // segundos
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  /** Configuração do Content Security Policy (CSP) */
  csp?: {
    enabled: boolean;
    directives?: {
      defaultSrc?: string[];
      scriptSrc?: string[];
      styleSrc?: string[];
      imgSrc?: string[];
      connectSrc?: string[];
      fontSrc?: string[];
      objectSrc?: string[];
      mediaSrc?: string[];
      frameSrc?: string[];
    };
  };
  /** Configuração do X-Frame-Options */
  frameOptions?: {
    enabled: boolean;
    value?: "DENY" | "SAMEORIGIN" | string; // permite ALLOW-FROM uri também
  };
  /** Configuração do X-Content-Type-Options */
  contentTypeOptions?: {
    enabled: boolean;
  };
  /** Configuração do X-XSS-Protection */
  xssProtection?: {
    enabled: boolean;
    block?: boolean;
  };
  /** Configuração do Referrer-Policy */
  referrerPolicy?: {
    enabled: boolean;
    policy?: string;
  };
  /** Configuração de Permissions-Policy */
  permissionsPolicy?: {
    enabled: boolean;
    directives?: Record<string, string[]>;
  };
  /** Remover headers que expõem informações do servidor */
  hideServerInfo?: {
    enabled: boolean;
    customServerHeader?: string;
  };
}

/**
 * Configuração padrão de segurança para APIs
 */
const defaultSecurityConfig: SecurityHeadersConfig = {
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"],
      connectSrc: ["'none'"],
      fontSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  frameOptions: {
    enabled: true,
    value: "DENY",
  },
  contentTypeOptions: {
    enabled: true,
  },
  xssProtection: {
    enabled: true,
    block: true,
  },
  referrerPolicy: {
    enabled: true,
    policy: "strict-origin-when-cross-origin",
  },
  permissionsPolicy: {
    enabled: true,
    directives: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
    },
  },
  hideServerInfo: {
    enabled: true,
    customServerHeader: "API-Server",
  },
};

/**
 * Gera o valor do Content Security Policy baseado nas diretivas
 */
const generateCSPValue = (
  directives: NonNullable<SecurityHeadersConfig["csp"]>["directives"],
): string => {
  if (!directives) return "";

  return Object.entries(directives)
    .map(([directive, sources]) => {
      const directiveName = directive.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${directiveName} ${sources.join(" ")}`;
    })
    .join("; ");
};

/**
 * Gera o valor do Permissions Policy baseado nas diretivas
 */
const generatePermissionsPolicyValue = (
  directives: Record<string, string[]>,
): string => {
  return Object.entries(directives)
    .map(([feature, allowlist]) => {
      if (allowlist.length === 0) {
        return `${feature}=()`;
      }
      return `${feature}=(${allowlist.map((origin) => `"${origin}"`).join(" ")})`;
    })
    .join(", ");
};

/**
 * Middleware de segurança para headers HTTP
 * Adiciona headers de segurança essenciais para proteger contra ataques comuns
 */
export const securityHeaders = (config: SecurityHeadersConfig = {}) => {
  const finalConfig = { ...defaultSecurityConfig, ...config };

  return (_req: Request, res: Response, next: NextFunction): void => {
    // HSTS - Força HTTPS
    if (finalConfig.hsts?.enabled) {
      let hstsValue = `max-age=${finalConfig.hsts.maxAge}`;
      if (finalConfig.hsts.includeSubDomains) {
        hstsValue += "; includeSubDomains";
      }
      if (finalConfig.hsts.preload) {
        hstsValue += "; preload";
      }
      res.setHeader("Strict-Transport-Security", hstsValue);
    }

    // CSP - Content Security Policy
    if (finalConfig.csp?.enabled) {
      const cspValue = generateCSPValue(finalConfig.csp.directives);
      if (cspValue) {
        res.setHeader("Content-Security-Policy", cspValue);
      }
    }

    // X-Frame-Options - Proteção contra clickjacking
    if (finalConfig.frameOptions?.enabled) {
      res.setHeader(
        "X-Frame-Options",
        finalConfig.frameOptions.value || "DENY",
      );
    }

    // X-Content-Type-Options - Previne MIME sniffing
    if (finalConfig.contentTypeOptions?.enabled) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    }

    // X-XSS-Protection - Proteção XSS legada (ainda útil para browsers antigos)
    if (finalConfig.xssProtection?.enabled) {
      const xssValue = finalConfig.xssProtection.block ? "1; mode=block" : "1";
      res.setHeader("X-XSS-Protection", xssValue);
    }

    // Referrer-Policy - Controla informações de referrer
    if (finalConfig.referrerPolicy?.enabled) {
      res.setHeader(
        "Referrer-Policy",
        finalConfig.referrerPolicy.policy || "strict-origin-when-cross-origin",
      );
    }

    // Permissions-Policy - Controla APIs do browser
    if (
      finalConfig.permissionsPolicy?.enabled &&
      finalConfig.permissionsPolicy.directives
    ) {
      const permissionsValue = generatePermissionsPolicyValue(
        finalConfig.permissionsPolicy.directives,
      );
      if (permissionsValue) {
        res.setHeader("Permissions-Policy", permissionsValue);
      }
    }

    // Remove headers que expõem informações do servidor
    if (finalConfig.hideServerInfo?.enabled) {
      res.removeHeader("X-Powered-By");
      if (finalConfig.hideServerInfo.customServerHeader) {
        res.setHeader("Server", finalConfig.hideServerInfo.customServerHeader);
      }
    }

    next();
  };
};

/**
 * Middleware de segurança com configuração específica para desenvolvimento
 * Permite conexões locais e ferramentas de desenvolvimento
 */
export const securityHeadersDev = () => {
  const devConfig: SecurityHeadersConfig = {
    hsts: {
      enabled: false, // Desabilitado em desenvolvimento (HTTP)
    },
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    frameOptions: {
      enabled: true,
      value: "SAMEORIGIN",
    },
    contentTypeOptions: {
      enabled: true,
    },
    xssProtection: {
      enabled: true,
      block: true,
    },
    referrerPolicy: {
      enabled: true,
      policy: "strict-origin-when-cross-origin",
    },
    permissionsPolicy: {
      enabled: true,
      directives: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
      },
    },
    hideServerInfo: {
      enabled: true,
      customServerHeader: "API-Dev-Server",
    },
  };

  return securityHeaders(devConfig);
};

/**
 * Middleware de segurança com configuração específica para produção
 * Configuração mais restritiva para ambiente de produção
 */
export const securityHeadersProd = () => {
  return securityHeaders(defaultSecurityConfig);
};
