import { randomUUID } from "crypto";

import { UserSession } from "../../../domain/entities";
import { SessionRepository } from "../../../domain/repositories";

export class SessionRepositoryInMemory implements SessionRepository {
  private readonly sessions: Map<string, UserSession> = new Map();

  public readonly create = async (
    session: Omit<UserSession, "id" | "createdAt" | "lastAccessAt">,
  ): Promise<UserSession> => {
    const now = new Date();
    const newSession: UserSession = {
      ...session,
      id: randomUUID(),
      createdAt: now,
      lastAccessAt: now,
    };

    this.sessions.set(newSession.id, newSession);
    return newSession;
  };

  public readonly findByToken = async (
    token: string,
  ): Promise<UserSession | null> => {
    for (const session of this.sessions.values()) {
      if (
        session.token === token &&
        session.isActive &&
        session.expiresAt > new Date()
      ) {
        return session;
      }
    }
    return null;
  };

  public readonly findByRefreshToken = async (
    refreshToken: string,
  ): Promise<UserSession | null> => {
    for (const session of this.sessions.values()) {
      if (
        session.refreshToken === refreshToken &&
        session.isActive &&
        session.expiresAt > new Date()
      ) {
        return session;
      }
    }
    return null;
  };

  public readonly findBySessionId = async (
    sessionId: string,
  ): Promise<UserSession | null> => {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive || session.expiresAt <= new Date()) {
      return null;
    }

    return session;
  };

  public readonly findActiveByUserId = async (
    userId: string,
  ): Promise<UserSession | null> => {
    for (const session of this.sessions.values()) {
      if (
        session.userId === userId &&
        session.isActive &&
        session.expiresAt > new Date()
      ) {
        return session;
      }
    }
    return null;
  };

  public readonly updateLastAccess = async (
    sessionId: string,
  ): Promise<void> => {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.lastAccessAt = new Date();
      this.sessions.set(sessionId, session);
    }
  };

  public readonly updateToken = async (
    sessionId: string,
    newToken: string,
  ): Promise<void> => {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.token = newToken;
      session.lastAccessAt = new Date();
      this.sessions.set(sessionId, session);
    }
  };

  public readonly updateRefreshToken = async (
    sessionId: string,
    newRefreshToken: string,
  ): Promise<void> => {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.refreshToken = newRefreshToken;
      session.lastAccessAt = new Date();
      this.sessions.set(sessionId, session);
    }
  };

  public readonly deactivateSession = async (
    sessionId: string,
  ): Promise<void> => {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  };

  public readonly deactivateAllUserSessions = async (
    userId: string,
  ): Promise<void> => {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
      }
    }
  };

  public readonly deleteExpiredSessions = async (): Promise<void> => {
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now || !session.isActive) {
        this.sessions.delete(sessionId);
      }
    }
  };
}
