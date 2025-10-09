import { SecurityLoggerProtocol } from "../../application/protocols";
import { authSecurityLogger } from "./middlewares";

/**
 * Adapter que implementa SecurityLoggerProtocol usando o authSecurityLogger existente.
 * Permite que a camada de aplicação não dependa diretamente da infraestrutura.
 *
 * Nota: sessionId é ignorado pois authSecurityLogger usa Request do Express.
 * Em uma implementação futura, poderíamos criar um Request mock ou melhorar o logger.
 */
export class SecurityLoggerAdapter implements SecurityLoggerProtocol {
  public logLogin(
    success: boolean,
    userId: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): void {
    // authSecurityLogger.logLogin espera (success, userId?, req?, metadata?)
    // Passamos undefined para req pois não temos Request no contexto do service
    authSecurityLogger.logLogin(success, userId, undefined, {
      ...metadata,
      sessionId, // Incluímos sessionId no metadata
    });
  }

  public logLoginBlocked(
    identifier: string,
    sessionId: string | undefined,
    reason: string,
  ): void {
    authSecurityLogger.logLoginBlocked(identifier, undefined, reason);
  }

  public logLogout(userId: string): void {
    authSecurityLogger.logLogout(userId, undefined);
  }

  public logTokenRefresh(userId: string): void {
    authSecurityLogger.logTokenRefresh(userId, undefined);
  }

  public logAccessDenied(
    userId: string,
    resource: string,
    reason: string,
    metadata?: Record<string, unknown>,
  ): void {
    // authSecurityLogger não tem logAccessDenied específico
    // Usamos logLogin com success=false para registrar
    authSecurityLogger.logLogin(false, userId, undefined, {
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
    authSecurityLogger.logLogin(false, identifier, undefined, {
      type: "SUSPICIOUS_ACTIVITY",
      activityType,
      ...details,
    });
  }
}
