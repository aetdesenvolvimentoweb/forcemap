import { UserSession } from "../../../../../src/domain/entities";
import { SessionRepositoryInMemory } from "../../../../../src/infra/repositories";

describe("SessionRepositoryInMemory", () => {
  let sut: SessionRepositoryInMemory;

  beforeEach(() => {
    sut = new SessionRepositoryInMemory();
  });

  const createMockSessionData = (
    overrides: Partial<
      Omit<UserSession, "id" | "createdAt" | "lastAccessAt">
    > = {},
  ): Omit<UserSession, "id" | "createdAt" | "lastAccessAt"> => ({
    userId: "user-123",
    token: "jwt-token-123",
    refreshToken: "refresh-token-123",
    deviceInfo: "iPhone 12",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
    isActive: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    ...overrides,
  });

  describe("create", () => {
    it("should create session successfully", async () => {
      const sessionData = createMockSessionData();

      const result = await sut.create(sessionData);

      expect(result).toEqual(
        expect.objectContaining({
          ...sessionData,
          id: expect.any(String),
          createdAt: expect.any(Date),
          lastAccessAt: expect.any(Date),
        }),
      );
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(result.createdAt).toEqual(result.lastAccessAt);
    });

    it("should generate unique IDs for each session", async () => {
      const sessionData1 = createMockSessionData({ userId: "user-1" });
      const sessionData2 = createMockSessionData({ userId: "user-2" });

      const result1 = await sut.create(sessionData1);
      const result2 = await sut.create(sessionData2);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(result2.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("should set createdAt and lastAccessAt to same time", async () => {
      const sessionData = createMockSessionData();
      const beforeCreate = new Date();

      const result = await sut.create(sessionData);

      const afterCreate = new Date();
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
      expect(result.lastAccessAt.getTime()).toBe(result.createdAt.getTime());
    });
  });

  describe("findByToken", () => {
    it("should find active session by token", async () => {
      const sessionData = createMockSessionData({ token: "test-token-123" });
      const createdSession = await sut.create(sessionData);

      const result = await sut.findByToken("test-token-123");

      expect(result).toEqual(createdSession);
    });

    it("should return null for non-existent token", async () => {
      const result = await sut.findByToken("non-existent-token");

      expect(result).toBeNull();
    });

    it("should return null for inactive session", async () => {
      const sessionData = createMockSessionData({
        token: "inactive-token",
        isActive: false,
      });
      await sut.create(sessionData);

      const result = await sut.findByToken("inactive-token");

      expect(result).toBeNull();
    });

    it("should return null for expired session", async () => {
      const sessionData = createMockSessionData({
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      await sut.create(sessionData);

      const result = await sut.findByToken("expired-token");

      expect(result).toBeNull();
    });

    it("should find session that expires in future", async () => {
      const futureExpiry = new Date(Date.now() + 60000); // 1 minute from now
      const sessionData = createMockSessionData({
        token: "future-token",
        expiresAt: futureExpiry,
      });
      const createdSession = await sut.create(sessionData);

      const result = await sut.findByToken("future-token");

      expect(result).toEqual(createdSession);
    });
  });

  describe("findByRefreshToken", () => {
    it("should find active session by refresh token", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "refresh-123",
      });
      const createdSession = await sut.create(sessionData);

      const result = await sut.findByRefreshToken("refresh-123");

      expect(result).toEqual(createdSession);
    });

    it("should return null for non-existent refresh token", async () => {
      const result = await sut.findByRefreshToken("non-existent-refresh");

      expect(result).toBeNull();
    });

    it("should return null for inactive session", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "inactive-refresh",
        isActive: false,
      });
      await sut.create(sessionData);

      const result = await sut.findByRefreshToken("inactive-refresh");

      expect(result).toBeNull();
    });

    it("should return null for expired session", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "expired-refresh",
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      await sut.create(sessionData);

      const result = await sut.findByRefreshToken("expired-refresh");

      expect(result).toBeNull();
    });
  });

  describe("findBySessionId", () => {
    it("should find active session by session ID", async () => {
      const sessionData = createMockSessionData();
      const createdSession = await sut.create(sessionData);

      const result = await sut.findBySessionId(createdSession.id);

      expect(result).toEqual(createdSession);
    });

    it("should return null for non-existent session ID", async () => {
      const result = await sut.findBySessionId("non-existent-id");

      expect(result).toBeNull();
    });

    it("should return null for inactive session", async () => {
      const sessionData = createMockSessionData({ isActive: false });
      const createdSession = await sut.create(sessionData);

      const result = await sut.findBySessionId(createdSession.id);

      expect(result).toBeNull();
    });

    it("should return null for expired session", async () => {
      const sessionData = createMockSessionData({
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      const createdSession = await sut.create(sessionData);

      const result = await sut.findBySessionId(createdSession.id);

      expect(result).toBeNull();
    });
  });

  describe("findActiveByUserId", () => {
    it("should find active session by user ID", async () => {
      const sessionData = createMockSessionData({ userId: "user-456" });
      const createdSession = await sut.create(sessionData);

      const result = await sut.findActiveByUserId("user-456");

      expect(result).toEqual(createdSession);
    });

    it("should return null for non-existent user ID", async () => {
      const result = await sut.findActiveByUserId("non-existent-user");

      expect(result).toBeNull();
    });

    it("should return null for inactive session", async () => {
      const sessionData = createMockSessionData({
        userId: "inactive-user",
        isActive: false,
      });
      await sut.create(sessionData);

      const result = await sut.findActiveByUserId("inactive-user");

      expect(result).toBeNull();
    });

    it("should return null for expired session", async () => {
      const sessionData = createMockSessionData({
        userId: "expired-user",
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      await sut.create(sessionData);

      const result = await sut.findActiveByUserId("expired-user");

      expect(result).toBeNull();
    });

    it("should return first active session when user has multiple sessions", async () => {
      const sessionData1 = createMockSessionData({
        userId: "multi-user",
        token: "token-1",
      });
      const sessionData2 = createMockSessionData({
        userId: "multi-user",
        token: "token-2",
      });

      const createdSession1 = await sut.create(sessionData1);
      await sut.create(sessionData2);

      const result = await sut.findActiveByUserId("multi-user");

      expect(result).toEqual(createdSession1);
    });
  });

  describe("updateLastAccess", () => {
    it("should update last access time for existing session", async () => {
      const sessionData = createMockSessionData();
      const createdSession = await sut.create(sessionData);
      const originalLastAccess = createdSession.lastAccessAt;

      // Wait a bit to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 1));

      await sut.updateLastAccess(createdSession.id);

      const updatedSession = await sut.findBySessionId(createdSession.id);
      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.lastAccessAt.getTime()).toBeGreaterThanOrEqual(
        originalLastAccess.getTime(),
      );
    });

    it("should not affect other properties when updating last access", async () => {
      const sessionData = createMockSessionData();
      const createdSession = await sut.create(sessionData);

      await sut.updateLastAccess(createdSession.id);

      const updatedSession = await sut.findBySessionId(createdSession.id);
      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.id).toBe(createdSession.id);
      expect(updatedSession!.token).toBe(createdSession.token);
      expect(updatedSession!.isActive).toBe(createdSession.isActive);
      expect(updatedSession!.createdAt).toEqual(createdSession.createdAt);
    });

    it("should handle update for non-existent session gracefully", async () => {
      await sut.updateLastAccess("non-existent-id");

      // Should not throw error and session should remain non-existent
      const result = await sut.findBySessionId("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("updateToken", () => {
    it("should update token and last access time", async () => {
      const sessionData = createMockSessionData({ token: "old-token" });
      const createdSession = await sut.create(sessionData);
      const originalLastAccess = createdSession.lastAccessAt;

      // Wait a bit to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 1));

      await sut.updateToken(createdSession.id, "new-token");

      const updatedSession = await sut.findBySessionId(createdSession.id);
      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.token).toBe("new-token");
      expect(updatedSession!.lastAccessAt.getTime()).toBeGreaterThanOrEqual(
        originalLastAccess.getTime(),
      );
    });

    it("should not affect other properties when updating token", async () => {
      const sessionData = createMockSessionData({ token: "old-token" });
      const createdSession = await sut.create(sessionData);

      await sut.updateToken(createdSession.id, "new-token");

      const updatedSession = await sut.findBySessionId(createdSession.id);
      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.id).toBe(createdSession.id);
      expect(updatedSession!.userId).toBe(createdSession.userId);
      expect(updatedSession!.refreshToken).toBe(createdSession.refreshToken);
      expect(updatedSession!.isActive).toBe(createdSession.isActive);
      expect(updatedSession!.createdAt).toEqual(createdSession.createdAt);
    });

    it("should handle update for non-existent session gracefully", async () => {
      await sut.updateToken("non-existent-id", "new-token");

      // Should not throw error and session should remain non-existent
      const result = await sut.findBySessionId("non-existent-id");
      expect(result).toBeNull();
    });

    it("should allow finding session with new token", async () => {
      const sessionData = createMockSessionData({ token: "old-token" });
      const createdSession = await sut.create(sessionData);

      await sut.updateToken(createdSession.id, "new-token");

      const foundByOldToken = await sut.findByToken("old-token");
      const foundByNewToken = await sut.findByToken("new-token");

      expect(foundByOldToken).toBeNull();
      expect(foundByNewToken).not.toBeNull();
      expect(foundByNewToken!.id).toBe(createdSession.id);
    });
  });

  describe("updateRefreshToken", () => {
    it("should update refresh token and last access time", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "old-refresh-token",
      });
      const createdSession = await sut.create(sessionData);
      const originalLastAccess = createdSession.lastAccessAt;

      // Wait a bit to ensure time difference
      await new Promise((resolve) => setTimeout(resolve, 1));

      await sut.updateRefreshToken(createdSession.id, "new-refresh-token");

      const updatedSession = await sut.findBySessionId(createdSession.id);
      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.refreshToken).toBe("new-refresh-token");
      expect(updatedSession!.lastAccessAt.getTime()).toBeGreaterThanOrEqual(
        originalLastAccess.getTime(),
      );
    });

    it("should not affect other properties when updating refresh token", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "old-refresh-token",
      });
      const createdSession = await sut.create(sessionData);

      await sut.updateRefreshToken(createdSession.id, "new-refresh-token");

      const updatedSession = await sut.findBySessionId(createdSession.id);
      expect(updatedSession).not.toBeNull();
      expect(updatedSession!.id).toBe(createdSession.id);
      expect(updatedSession!.userId).toBe(createdSession.userId);
      expect(updatedSession!.token).toBe(createdSession.token);
      expect(updatedSession!.isActive).toBe(createdSession.isActive);
      expect(updatedSession!.createdAt).toEqual(createdSession.createdAt);
    });

    it("should handle update for non-existent session gracefully", async () => {
      await sut.updateRefreshToken("non-existent-id", "new-refresh-token");

      // Should not throw error and session should remain non-existent
      const result = await sut.findBySessionId("non-existent-id");
      expect(result).toBeNull();
    });

    it("should allow finding session with new refresh token", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "old-refresh-token",
      });
      const createdSession = await sut.create(sessionData);

      await sut.updateRefreshToken(createdSession.id, "new-refresh-token");

      const foundByOldRefreshToken =
        await sut.findByRefreshToken("old-refresh-token");
      const foundByNewRefreshToken =
        await sut.findByRefreshToken("new-refresh-token");

      expect(foundByOldRefreshToken).toBeNull();
      expect(foundByNewRefreshToken).not.toBeNull();
      expect(foundByNewRefreshToken!.id).toBe(createdSession.id);
    });
  });

  describe("deactivateSession", () => {
    it("should deactivate existing session", async () => {
      const sessionData = createMockSessionData();
      const createdSession = await sut.create(sessionData);

      await sut.deactivateSession(createdSession.id);

      const foundSession = await sut.findBySessionId(createdSession.id);
      expect(foundSession).toBeNull(); // Should return null because session is inactive
    });

    it("should make session unfindable by token after deactivation", async () => {
      const sessionData = createMockSessionData({ token: "active-token" });
      const createdSession = await sut.create(sessionData);

      await sut.deactivateSession(createdSession.id);

      const foundByToken = await sut.findByToken("active-token");
      expect(foundByToken).toBeNull();
    });

    it("should make session unfindable by refresh token after deactivation", async () => {
      const sessionData = createMockSessionData({
        refreshToken: "active-refresh",
      });
      const createdSession = await sut.create(sessionData);

      await sut.deactivateSession(createdSession.id);

      const foundByRefreshToken =
        await sut.findByRefreshToken("active-refresh");
      expect(foundByRefreshToken).toBeNull();
    });

    it("should make session unfindable by user ID after deactivation", async () => {
      const sessionData = createMockSessionData({ userId: "active-user" });
      const createdSession = await sut.create(sessionData);

      await sut.deactivateSession(createdSession.id);

      const foundByUserId = await sut.findActiveByUserId("active-user");
      expect(foundByUserId).toBeNull();
    });

    it("should handle deactivation of non-existent session gracefully", async () => {
      await sut.deactivateSession("non-existent-id");

      // Should not throw error
      const result = await sut.findBySessionId("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("deactivateAllUserSessions", () => {
    it("should deactivate all sessions for a user", async () => {
      const userId = "test-user";
      const sessionData1 = createMockSessionData({ userId, token: "token-1" });
      const sessionData2 = createMockSessionData({ userId, token: "token-2" });
      const sessionData3 = createMockSessionData({ userId, token: "token-3" });

      await sut.create(sessionData1);
      await sut.create(sessionData2);
      await sut.create(sessionData3);

      await sut.deactivateAllUserSessions(userId);

      const foundByToken1 = await sut.findByToken("token-1");
      const foundByToken2 = await sut.findByToken("token-2");
      const foundByToken3 = await sut.findByToken("token-3");

      expect(foundByToken1).toBeNull();
      expect(foundByToken2).toBeNull();
      expect(foundByToken3).toBeNull();
    });

    it("should not affect sessions of other users", async () => {
      const sessionData1 = createMockSessionData({
        userId: "user-1",
        token: "token-1",
      });
      const sessionData2 = createMockSessionData({
        userId: "user-2",
        token: "token-2",
      });

      await sut.create(sessionData1);
      const createdSession2 = await sut.create(sessionData2);

      await sut.deactivateAllUserSessions("user-1");

      const foundUser1Session = await sut.findByToken("token-1");
      const foundUser2Session = await sut.findByToken("token-2");

      expect(foundUser1Session).toBeNull();
      expect(foundUser2Session).toEqual(createdSession2);
    });

    it("should handle deactivation for user with no sessions gracefully", async () => {
      await sut.deactivateAllUserSessions("non-existent-user");

      // Should not throw error
      const result = await sut.findActiveByUserId("non-existent-user");
      expect(result).toBeNull();
    });
  });

  describe("deleteExpiredSessions", () => {
    it("should delete expired sessions", async () => {
      const expiredSessionData = createMockSessionData({
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      const activeSessionData = createMockSessionData({
        token: "active-token",
        expiresAt: new Date(Date.now() + 60000), // 1 minute from now
      });

      const expiredSession = await sut.create(expiredSessionData);
      const activeSession = await sut.create(activeSessionData);

      await sut.deleteExpiredSessions();

      // Expired session should be deleted (can't find it even by ID)
      const foundExpiredById = await sut.findBySessionId(expiredSession.id);
      expect(foundExpiredById).toBeNull();

      // Active session should still exist
      const foundActiveById = await sut.findBySessionId(activeSession.id);
      expect(foundActiveById).toEqual(activeSession);
    });

    it("should delete inactive sessions", async () => {
      const inactiveSessionData = createMockSessionData({
        token: "inactive-token",
        isActive: false,
      });
      const activeSessionData = createMockSessionData({
        token: "active-token",
        isActive: true,
      });

      const inactiveSession = await sut.create(inactiveSessionData);
      const activeSession = await sut.create(activeSessionData);

      await sut.deleteExpiredSessions();

      // Inactive session should be deleted
      const foundInactiveById = await sut.findBySessionId(inactiveSession.id);
      expect(foundInactiveById).toBeNull();

      // Active session should still exist
      const foundActiveById = await sut.findBySessionId(activeSession.id);
      expect(foundActiveById).toEqual(activeSession);
    });

    it("should delete both expired and inactive sessions", async () => {
      const expiredInactiveSessionData = createMockSessionData({
        token: "expired-inactive-token",
        isActive: false,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      const activeSessionData = createMockSessionData({
        token: "active-token",
        isActive: true,
      });

      const expiredInactiveSession = await sut.create(
        expiredInactiveSessionData,
      );
      const activeSession = await sut.create(activeSessionData);

      await sut.deleteExpiredSessions();

      const foundExpiredInactiveById = await sut.findBySessionId(
        expiredInactiveSession.id,
      );
      expect(foundExpiredInactiveById).toBeNull();

      const foundActiveById = await sut.findBySessionId(activeSession.id);
      expect(foundActiveById).toEqual(activeSession);
    });

    it("should handle empty session store gracefully", async () => {
      await sut.deleteExpiredSessions();

      // Should not throw error
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete session lifecycle", async () => {
      // Create session
      const sessionData = createMockSessionData({
        userId: "test-user",
        token: "initial-token",
      });
      const createdSession = await sut.create(sessionData);

      // Find by various methods
      const foundById = await sut.findBySessionId(createdSession.id);
      const foundByToken = await sut.findByToken("initial-token");
      const foundByUserId = await sut.findActiveByUserId("test-user");

      expect(foundById).toEqual(createdSession);
      expect(foundByToken).toEqual(createdSession);
      expect(foundByUserId).toEqual(createdSession);

      // Update token
      await sut.updateToken(createdSession.id, "updated-token");
      const foundByNewToken = await sut.findByToken("updated-token");
      expect(foundByNewToken).not.toBeNull();
      expect(foundByNewToken!.token).toBe("updated-token");

      // Update refresh token
      await sut.updateRefreshToken(createdSession.id, "updated-refresh-token");
      const foundByNewRefreshToken = await sut.findByRefreshToken(
        "updated-refresh-token",
      );
      expect(foundByNewRefreshToken).not.toBeNull();
      expect(foundByNewRefreshToken!.refreshToken).toBe(
        "updated-refresh-token",
      );

      // Update last access
      const beforeAccessUpdate = foundByNewToken!.lastAccessAt;
      await new Promise((resolve) => setTimeout(resolve, 10)); // Increased delay for reliable timing
      await sut.updateLastAccess(createdSession.id);
      const afterAccessUpdate = await sut.findBySessionId(createdSession.id);
      expect(afterAccessUpdate!.lastAccessAt.getTime()).toBeGreaterThanOrEqual(
        beforeAccessUpdate.getTime(),
      );

      // Deactivate session
      await sut.deactivateSession(createdSession.id);
      const foundAfterDeactivation = await sut.findByToken("updated-token");
      expect(foundAfterDeactivation).toBeNull();
    });

    it("should handle multiple users with multiple sessions", async () => {
      // Create sessions for multiple users
      const user1Sessions = [
        createMockSessionData({ userId: "user-1", token: "user1-token1" }),
        createMockSessionData({ userId: "user-1", token: "user1-token2" }),
      ];
      const user2Sessions = [
        createMockSessionData({ userId: "user-2", token: "user2-token1" }),
      ];

      for (const sessionData of [...user1Sessions, ...user2Sessions]) {
        await sut.create(sessionData);
      }

      // Verify sessions exist
      expect(await sut.findByToken("user1-token1")).not.toBeNull();
      expect(await sut.findByToken("user1-token2")).not.toBeNull();
      expect(await sut.findByToken("user2-token1")).not.toBeNull();

      // Deactivate all sessions for user-1
      await sut.deactivateAllUserSessions("user-1");

      // Verify user-1 sessions are deactivated
      expect(await sut.findByToken("user1-token1")).toBeNull();
      expect(await sut.findByToken("user1-token2")).toBeNull();

      // Verify user-2 sessions are still active
      expect(await sut.findByToken("user2-token1")).not.toBeNull();
    });

    it("should maintain data consistency across concurrent operations", async () => {
      const sessionData = createMockSessionData({ userId: "concurrent-user" });
      const createdSession = await sut.create(sessionData);

      // Simulate concurrent operations
      const operations = [
        sut.updateLastAccess(createdSession.id),
        sut.updateToken(createdSession.id, "concurrent-token"),
        sut.findBySessionId(createdSession.id),
      ];

      await Promise.all(operations);

      // Verify final state
      const finalSession = await sut.findBySessionId(createdSession.id);
      expect(finalSession).not.toBeNull();
      expect(finalSession!.token).toBe("concurrent-token");
      expect(finalSession!.userId).toBe("concurrent-user");
    });
  });
});
