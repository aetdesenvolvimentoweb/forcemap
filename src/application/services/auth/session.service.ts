import { UserSession } from "../../../domain/entities";
import { SessionRepository } from "../../../domain/repositories";
import { UnauthorizedError } from "../../errors";

interface SessionServiceDependencies {
  sessionRepository: SessionRepository;
}

export class SessionService {
  constructor(private readonly dependencies: SessionServiceDependencies) {}

  public readonly create = async (
    data: Omit<UserSession, "id" | "createdAt" | "lastAccessAt">,
  ): Promise<UserSession> => {
    return this.dependencies.sessionRepository.create(data);
  };

  public readonly updateToken = async (
    sessionId: string,
    token: string,
  ): Promise<void> => {
    await this.dependencies.sessionRepository.updateToken(sessionId, token);
  };

  public readonly updateRefreshToken = async (
    sessionId: string,
    refreshToken: string,
  ): Promise<void> => {
    await this.dependencies.sessionRepository.updateRefreshToken(
      sessionId,
      refreshToken,
    );
  };

  public readonly updateLastAccess = async (
    sessionId: string,
  ): Promise<void> => {
    await this.dependencies.sessionRepository.updateLastAccess(sessionId);
  };

  public readonly findBySessionId = async (
    sessionId: string,
  ): Promise<UserSession | null> => {
    return this.dependencies.sessionRepository.findBySessionId(sessionId);
  };

  public readonly findByRefreshToken = async (
    refreshToken: string,
  ): Promise<UserSession | null> => {
    return this.dependencies.sessionRepository.findByRefreshToken(refreshToken);
  };

  public readonly deactivateSession = async (
    sessionId: string,
  ): Promise<void> => {
    await this.dependencies.sessionRepository.deactivateSession(sessionId);
  };

  public readonly deactivateAllUserSessions = async (
    userId: string,
  ): Promise<void> => {
    await this.dependencies.sessionRepository.deactivateAllUserSessions(userId);
  };

  public readonly validateSession = async (
    sessionId: string,
  ): Promise<boolean> => {
    try {
      const session = await this.findBySessionId(sessionId);
      return session !== null && session.isActive;
    } catch {
      return false;
    }
  };

  public readonly validateAndGetActiveSession = async (
    sessionId: string,
  ): Promise<UserSession> => {
    const session = await this.findBySessionId(sessionId);

    if (!session) {
      throw new UnauthorizedError("Sessão não encontrada");
    }

    if (!session.isActive) {
      throw new UnauthorizedError("Sessão inativa");
    }

    return session;
  };
}
