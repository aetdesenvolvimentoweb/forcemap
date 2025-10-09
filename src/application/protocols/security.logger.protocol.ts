export interface SecurityLoggerProtocol {
  logLogin(
    success: boolean,
    userId: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): void;

  logLoginBlocked(
    identifier: string,
    sessionId: string | undefined,
    reason: string,
  ): void;

  logLogout(userId: string, sessionId?: string, reason?: string): void;

  logTokenRefresh(
    userId: string,
    sessionId?: string,
    metadata?: Record<string, unknown>,
  ): void;

  logAccessDenied(
    userId: string,
    resource: string,
    reason: string,
    metadata?: Record<string, unknown>,
  ): void;

  logSuspiciousActivity(
    identifier: string,
    activityType: string,
    details: Record<string, unknown>,
  ): void;
}
