import {
  LoggerProtocol,
  SecurityLoggerProtocol,
} from "../../application/protocols";
import { createAuthSecurityLogger } from "./middlewares";

/**
 * Adapter que implementa SecurityLoggerProtocol usando o authSecurityLogger.
 * Permite que a camada de aplicação não dependa diretamente da infraestrutura.
 *
 * Nota: sessionId é ignorado pois authSecurityLogger usa Request do Express.
 * Em uma implementação futura, poderíamos criar um Request mock ou melhorar o logger.
 */
export class SecurityLoggerAdapter implements SecurityLoggerProtocol {
  private readonly authSecurityLogger: ReturnType<
    typeof createAuthSecurityLogger
  >;

  constructor(logger: LoggerProtocol) {
    this.authSecurityLogger = createAuthSecurityLogger(logger);
  }

  public logLogin(
    success: boolean,
    userId: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): void {
    // authSecurityLogger.logLogin espera (success, userId?, req?, metadata?)
    // Passamos undefined para req pois não temos Request no contexto do service
    this.authSecurityLogger.logLogin(success, userId, undefined, {
      ...metadata,
      sessionId, // Incluímos sessionId no metadata
    });
  }

  public logLoginBlocked(
    identifier: string,
    sessionId: string | undefined,
    reason: string,
  ): void {
    this.authSecurityLogger.logLoginBlocked(identifier, undefined, reason);
  }

  public logLogout(userId: string): void {
    this.authSecurityLogger.logLogout(userId, undefined);
  }

  public logTokenRefresh(userId: string): void {
    this.authSecurityLogger.logTokenRefresh(userId, undefined);
  }

  public logAccessDenied(
    userId: string,
    resource: string,
    reason: string,
    metadata?: Record<string, unknown>,
  ): void {
    // authSecurityLogger não tem logAccessDenied específico
    // Usamos logLogin com success=false para registrar
    this.authSecurityLogger.logLogin(false, userId, undefined, {
      type: "ACCESS_DENIED",
      resource,
      reason,
      ...metadata,
    });
  }

  public logSuspiciousActivity(
    identifier: string,
    activityType: string,
    details: Record<string, unknown>,
  ): void {
    // authSecurityLogger não tem logSuspiciousActivity específico
    // Usamos logLogin com success=false para registrar
    this.authSecurityLogger.logLogin(false, identifier, undefined, {
      type: "SUSPICIOUS_ACTIVITY",
      activityType,
      ...details,
    });
  }
}
