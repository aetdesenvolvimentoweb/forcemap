import { SessionRepository } from "../../../domain/repositories/session.repository";
import { SessionRepositoryInMemory } from "../../../infra/repositories/in-memory/session.repository.in-memory";

let sessionRepositoryInstance: SessionRepository | null = null;

export const makeSessionRepository = (): SessionRepository => {
  if (!sessionRepositoryInstance) {
    sessionRepositoryInstance = new SessionRepositoryInMemory();
  }
  return sessionRepositoryInstance;
};
