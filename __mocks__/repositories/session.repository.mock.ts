import { SessionRepository } from "../../src/domain/repositories";

export const mockSessionRepository = (): jest.Mocked<SessionRepository> => ({
  findByToken: jest.fn(),
  updateLastAccess: jest.fn(),
  create: jest.fn(),
  findByRefreshToken: jest.fn(),
  findBySessionId: jest.fn(),
  findActiveByUserId: jest.fn(),
  updateToken: jest.fn(),
  deactivateSession: jest.fn(),
  deactivateAllUserSessions: jest.fn(),
  deleteExpiredSessions: jest.fn(),
});
