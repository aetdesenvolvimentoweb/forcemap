import { SessionRepository } from "../../src/domain/repositories/session.repository";

export const mockSessionRepository = (): jest.Mocked<SessionRepository> => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  deleteByUserId: jest.fn(),
  deleteByToken: jest.fn(),
});
