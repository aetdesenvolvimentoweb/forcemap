import { NextFunction, Request, Response } from "express";

/**
 * Tipos de eventos de segurança que podem ser logados
 */
export enum SecurityEventType {
  // Autenticação e Autorização
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGIN_BLOCKED = "LOGIN_BLOCKED",
  LOGOUT = "LOGOUT",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  TOKEN_INVALID = "TOKEN_INVALID",
  ACCESS_DENIED = "ACCESS_DENIED",

  // Rate Limiting
  RATE_LIMIT_HIT = "RATE_LIMIT_HIT",
  RATE_LIMIT_BLOCKED = "RATE_LIMIT_BLOCKED",

  // Ataques e Tentativas Suspeitas
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  CORS_VIOLATION = "CORS_VIOLATION",
  INVALID_INPUT = "INVALID_INPUT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",

  // Sistema
  SERVER_ERROR = "SERVER_ERROR",
  SECURITY_HEADER_MISSING = "SECURITY_HEADER_MISSING",
}

/**
 * Severidade do evento de segurança
 */
export enum SecurityEventSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Interface para eventos de segurança
 */
export interface SecurityEvent {
  timestamp: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  additionalData?: Record<string, unknown>;
}

/**
 * Interface para o logger de segurança
 */
export interface SecurityLogger {
  logSecurityEvent(event: SecurityEvent): void;
  logLoginAttempt(
    success: boolean,
    userId?: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void;
  logRateLimitHit(ipAddress: string, endpoint: string, limit: number): void;
  logSuspiciousActivity(
    description: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void;
  logCorsViolation(origin: string, ipAddress?: string): void;
  logAccessDenied(userId: string, resource: string, ipAddress?: string): void;
}

/**
 * Implementação do logger de segurança usando console estruturado
 */
class ConsoleSecurityLogger implements SecurityLogger {
  private formatSecurityLog(event: SecurityEvent): string {
    return JSON.stringify(
      {
        type: "SECURITY_EVENT",
        ...event,
      },
      null,
      2,
    );
  }

  logSecurityEvent(event: SecurityEvent): void {
    const logMethod = this.getLogMethod(event.severity);
    logMethod(`🔒 [SECURITY] ${this.formatSecurityLog(event)}`);
  }

  logLoginAttempt(
    success: boolean,
    userId?: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      eventType: success
        ? SecurityEventType.LOGIN_SUCCESS
        : SecurityEventType.LOGIN_FAILED,
      severity: success
        ? SecurityEventSeverity.LOW
        : SecurityEventSeverity.MEDIUM,
      message: success
        ? `Login bem-sucedido para usuário ${userId || "desconhecido"}`
        : `Tentativa de login falhada para usuário ${userId || "desconhecido"}`,
      userId,
      ipAddress,
      additionalData,
    };

    this.logSecurityEvent(event);
  }

  logRateLimitHit(ipAddress: string, endpoint: string, limit: number): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.RATE_LIMIT_HIT,
      severity: SecurityEventSeverity.MEDIUM,
      message: `Rate limit atingido para IP ${ipAddress} no endpoint ${endpoint} (limite: ${limit})`,
      ipAddress,
      endpoint,
      additionalData: { limit },
    };

    this.logSecurityEvent(event);
  }

  logSuspiciousActivity(
    description: string,
    ipAddress?: string,
    additionalData?: Record<string, unknown>,
  ): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: SecurityEventSeverity.HIGH,
      message: `Atividade suspeita detectada: ${description}`,
      ipAddress,
      additionalData,
    };

    this.logSecurityEvent(event);
  }

  logCorsViolation(origin: string, ipAddress?: string): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.CORS_VIOLATION,
      severity: SecurityEventSeverity.MEDIUM,
      message: `Violação CORS detectada da origem: ${origin}`,
      ipAddress,
      additionalData: { origin },
    };

    this.logSecurityEvent(event);
  }

  logAccessDenied(userId: string, resource: string, ipAddress?: string): void {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.ACCESS_DENIED,
      severity: SecurityEventSeverity.MEDIUM,
      message: `Acesso negado para usuário ${userId} ao recurso ${resource}`,
      userId,
      ipAddress,
      additionalData: { resource },
    };

    this.logSecurityEvent(event);
  }

  private getLogMethod(
    severity: SecurityEventSeverity,
  ): (message: string) => void {
    switch (severity) {
      case SecurityEventSeverity.LOW:
        return console.info;
      case SecurityEventSeverity.MEDIUM:
        return console.warn;
      case SecurityEventSeverity.HIGH:
      case SecurityEventSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }
}

/**
 * Instância global do logger de segurança
 */
export const securityLogger: SecurityLogger = new ConsoleSecurityLogger();

/**
 * Extrai informações da requisição para logging de segurança
 */
const extractRequestInfo = (req: Request) => ({
  ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
  userAgent: req.get("User-Agent") || "unknown",
  endpoint: req.path,
  method: req.method,
});

/**
 * Middleware para logging automático de eventos de segurança
 * Intercepta requisições e respostas para detectar eventos relevantes
 */
export const securityLogging = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const requestInfo = extractRequestInfo(req);

    // Intercepta o final da resposta para capturar o status
    const originalSend = res.send;
    res.send = function (body: unknown) {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log eventos baseados no status code
      if (statusCode === 401) {
        securityLogger.logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: SecurityEventType.TOKEN_INVALID,
          severity: SecurityEventSeverity.MEDIUM,
          message: "Token inválido ou expirado",
          ...requestInfo,
          statusCode,
          additionalData: { responseTime },
        });
      } else if (statusCode === 403) {
        securityLogger.logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: SecurityEventType.ACCESS_DENIED,
          severity: SecurityEventSeverity.MEDIUM,
          message: "Acesso negado ao recurso",
          ...requestInfo,
          statusCode,
          additionalData: { responseTime },
        });
      } else if (statusCode === 429) {
        securityLogger.logRateLimitHit(
          requestInfo.ipAddress,
          requestInfo.endpoint,
          0, // Limite específico seria obtido do rate limiter
        );
      } else if (statusCode >= 500) {
        securityLogger.logSecurityEvent({
          timestamp: new Date().toISOString(),
          eventType: SecurityEventType.SERVER_ERROR,
          severity: SecurityEventSeverity.HIGH,
          message: `Erro interno do servidor`,
          ...requestInfo,
          statusCode,
          additionalData: { responseTime },
        });
      }

      return originalSend.call(this, body);
    };

    // Detecta padrões suspeitos na URL/parâmetros
    const suspiciousPatterns = [
      /union.*select/i, // SQL Injection
      /<script.*>/i, // XSS
      /javascript:/i, // XSS
      /on\w+\s*=/i, // XSS event handlers
      /\.\.\/.*\.\.\/|\.\.\\.*\.\.\\/, // Path Traversal
      /%2e%2e%2f|%2e%2e%5c/i, // Encoded Path Traversal
      /null|0x[0-9a-f]+/i, // SQL Injection patterns
      /waitfor\s+delay/i, // SQL Injection timing
    ];

    const fullUrl = req.originalUrl || req.url;
    const bodyString = JSON.stringify(req.body || {});

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl) || pattern.test(bodyString)) {
        securityLogger.logSuspiciousActivity(
          `Padrão suspeito detectado: ${pattern.source}`,
          requestInfo.ipAddress,
          {
            url: fullUrl,
            hasBody: Object.keys(req.body || {}).length > 0,
            pattern: pattern.source,
          },
        );
        break; // Para evitar múltiplos logs para a mesma requisição
      }
    }

    next();
  };
};

/**
 * Extensões para logs específicos de autenticação
 */
export const authSecurityLogger = {
  /**
   * Log de tentativa de login
   */
  logLogin: (
    success: boolean,
    userId?: string,
    req?: Request,
    additionalData?: Record<string, unknown>,
  ) => {
    const ipAddress = req ? extractRequestInfo(req).ipAddress : undefined;
    securityLogger.logLoginAttempt(success, userId, ipAddress, additionalData);
  },

  /**
   * Log de logout
   */
  logLogout: (userId: string, req?: Request) => {
    const requestInfo = req ? extractRequestInfo(req) : {};
    securityLogger.logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.LOGOUT,
      severity: SecurityEventSeverity.LOW,
      message: `Logout realizado para usuário ${userId}`,
      userId,
      ...requestInfo,
    });
  },

  /**
   * Log de refresh de token
   */
  logTokenRefresh: (userId: string, req?: Request) => {
    const requestInfo = req ? extractRequestInfo(req) : {};
    securityLogger.logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.TOKEN_REFRESH,
      severity: SecurityEventSeverity.LOW,
      message: `Token refreshed para usuário ${userId}`,
      userId,
      ...requestInfo,
    });
  },

  /**
   * Log de bloqueio por tentativas excessivas
   */
  logLoginBlocked: (identifier: string, req?: Request, reason?: string) => {
    const requestInfo = req ? extractRequestInfo(req) : {};
    securityLogger.logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.LOGIN_BLOCKED,
      severity: SecurityEventSeverity.HIGH,
      message: `Login bloqueado para ${identifier}: ${reason || "tentativas excessivas"}`,
      ...requestInfo,
      additionalData: { identifier, reason },
    });
  },
};
