import { SessionRepository } from "../../../domain/repositories/session.repository";
import { SessionRepositoryInMemory } from "../../../infra/repositories/in-memory/session.repository.in-memory";

export const makeSessionRepository = (): SessionRepository => {
  return new SessionRepositoryInMemory();
};
