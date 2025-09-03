export interface SessionRepository {
  create(userId: string, token: string): Promise<void>;
  findByToken(token: string): Promise<string | null>; // Returns userId
  deleteByUserId(userId: string): Promise<void>;
  deleteByToken(token: string): Promise<void>;
}
