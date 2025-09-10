import { UserSession } from "../entities";

export interface SessionRepository {
  create(
    session: Omit<UserSession, "id" | "createdAt" | "lastAccessAt">,
  ): Promise<UserSession>;
  findByToken(token: string): Promise<UserSession | null>;
  findByRefreshToken(refreshToken: string): Promise<UserSession | null>;
  findBySessionId(sessionId: string): Promise<UserSession | null>;
  findActiveByUserId(userId: string): Promise<UserSession | null>;
  updateLastAccess(sessionId: string): Promise<void>;
  updateToken(sessionId: string, newToken: string): Promise<void>;
  deactivateSession(sessionId: string): Promise<void>;
  deactivateAllUserSessions(userId: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
}
