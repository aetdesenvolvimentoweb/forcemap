import {
  API_BASE_PATH,
  API_VERSION,
  API_VERSIONED_PATH,
  createVersionedPath,
} from "../../../../src/main/routes/api-version";

describe("API Version Configuration", () => {
  describe("Constants", () => {
    it("should have correct API_VERSION", () => {
      expect(API_VERSION).toBe("v1");
    });

    it("should have correct API_BASE_PATH", () => {
      expect(API_BASE_PATH).toBe("/api");
    });

    it("should have correct API_VERSIONED_PATH", () => {
      expect(API_VERSIONED_PATH).toBe("/api/v1");
    });

    it("should compose API_VERSIONED_PATH correctly", () => {
      expect(API_VERSIONED_PATH).toBe(`${API_BASE_PATH}/${API_VERSION}`);
    });
  });

  describe("createVersionedPath()", () => {
    it("should create versioned path for route with leading slash", () => {
      const result = createVersionedPath("/users");

      expect(result).toBe("/api/v1/users");
    });

    it("should create versioned path for route without leading slash", () => {
      const result = createVersionedPath("users");

      expect(result).toBe("/api/v1/users");
    });

    it("should handle nested routes with leading slash", () => {
      const result = createVersionedPath("/auth/login");

      expect(result).toBe("/api/v1/auth/login");
    });

    it("should handle nested routes without leading slash", () => {
      const result = createVersionedPath("auth/login");

      expect(result).toBe("/api/v1/auth/login");
    });

    it("should handle empty string by adding slash", () => {
      const result = createVersionedPath("");

      expect(result).toBe("/api/v1/");
    });

    it("should handle root path", () => {
      const result = createVersionedPath("/");

      expect(result).toBe("/api/v1/");
    });

    it("should handle paths with multiple segments", () => {
      const result = createVersionedPath("/users/123/posts/456");

      expect(result).toBe("/api/v1/users/123/posts/456");
    });

    it("should handle paths with query parameters", () => {
      const result = createVersionedPath("/users?active=true");

      expect(result).toBe("/api/v1/users?active=true");
    });

    it("should handle paths with special characters", () => {
      const result = createVersionedPath("/users/john-doe_123");

      expect(result).toBe("/api/v1/users/john-doe_123");
    });

    it("should not add double slashes for already correct paths", () => {
      const result = createVersionedPath("/military-ranks");

      expect(result).toBe("/api/v1/military-ranks");
      expect(result).not.toContain("//");
    });
  });

  describe("Path Consistency", () => {
    it("should produce same result regardless of leading slash", () => {
      const withSlash = createVersionedPath("/users");
      const withoutSlash = createVersionedPath("users");

      expect(withSlash).toBe(withoutSlash);
    });

    it("should always start with /api/v1", () => {
      const paths = [
        createVersionedPath("/users"),
        createVersionedPath("military"),
        createVersionedPath("/auth/login"),
        createVersionedPath("vehicles/123"),
      ];

      paths.forEach((path) => {
        expect(path).toMatch(/^\/api\/v1\//);
      });
    });

    it("should preserve double slashes if present in input (but not recommended)", () => {
      // Note: The function doesn't sanitize double slashes in the middle of paths
      // This test documents current behavior - input validation should happen before
      const pathWithDoubleSlash = createVersionedPath("/auth//login");
      expect(pathWithDoubleSlash).toBe("/api/v1/auth//login");

      // Normal paths should not have double slashes
      const normalPath = createVersionedPath("/users");
      expect(normalPath).toBe("/api/v1/users");
      expect(normalPath).not.toContain("//");
    });
  });

  describe("Real-world scenarios", () => {
    it("should create correct paths for all main routes", () => {
      const routes = {
        users: createVersionedPath("/users"),
        military: createVersionedPath("/military"),
        militaryRanks: createVersionedPath("/military-ranks"),
        vehicles: createVersionedPath("/vehicles"),
        authLogin: createVersionedPath("/auth/login"),
        authLogout: createVersionedPath("/auth/logout"),
        authRefresh: createVersionedPath("/auth/refresh"),
      };

      expect(routes.users).toBe("/api/v1/users");
      expect(routes.military).toBe("/api/v1/military");
      expect(routes.militaryRanks).toBe("/api/v1/military-ranks");
      expect(routes.vehicles).toBe("/api/v1/vehicles");
      expect(routes.authLogin).toBe("/api/v1/auth/login");
      expect(routes.authLogout).toBe("/api/v1/auth/logout");
      expect(routes.authRefresh).toBe("/api/v1/auth/refresh");
    });

    it("should create correct paths for resource operations", () => {
      const operations = {
        list: createVersionedPath("/users"),
        create: createVersionedPath("/users"),
        read: createVersionedPath("/users/123"),
        update: createVersionedPath("/users/123"),
        delete: createVersionedPath("/users/123"),
      };

      expect(operations.list).toBe("/api/v1/users");
      expect(operations.create).toBe("/api/v1/users");
      expect(operations.read).toBe("/api/v1/users/123");
      expect(operations.update).toBe("/api/v1/users/123");
      expect(operations.delete).toBe("/api/v1/users/123");
    });
  });

  describe("Edge cases", () => {
    it("should handle path with only slashes", () => {
      const result = createVersionedPath("///");

      expect(result).toMatch(/^\/api\/v1\//);
    });

    it("should handle path with spaces (though not recommended)", () => {
      const result = createVersionedPath("/users with spaces");

      expect(result).toBe("/api/v1/users with spaces");
    });

    it("should handle very long paths", () => {
      const longPath = "/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z";
      const result = createVersionedPath(longPath);

      expect(result).toBe(`/api/v1${longPath}`);
    });
  });
});
