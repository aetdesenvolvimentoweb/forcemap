import { NextFunction, Response } from "express";

// Mock the factory
const mockAuthMiddleware = {
  authenticate: jest.fn(),
  authorize: jest.fn(),
} as any;

jest.mock(
  "../../../../src/main/factories/middlewares/auth.middleware.factory",
  () => ({
    makeAuthMiddleware: () => mockAuthMiddleware,
  }),
);

import {
  AuthenticatedRequest,
  requireAuth,
  requireAuthWithRoles,
  requireRoles,
} from "../../../../src/main/middlewares/auth.middleware.helper";

describe("Auth Middleware Helper", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.SpyInstance;
  let statusSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
      headers: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" } as any,
    };

    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy as any,
      json: jsonSpy as any,
    };

    mockNext = jest.fn();
  });

  describe("requireAuth", () => {
    it("should call next() when authentication succeeds", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      } as any);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authenticate).toHaveBeenCalledWith({
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("should return error response when authentication fails with statusCode", async () => {
      const errorResponse = {
        statusCode: 401,
        body: { error: "Token inválido" },
      };

      mockAuthMiddleware.authenticate.mockResolvedValue(errorResponse);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it("should return 401 when authentication throws an exception", async () => {
      mockAuthMiddleware.authenticate.mockRejectedValue(new Error("JWT error"));

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Falha na autenticação",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass correct request data to authenticate", async () => {
      const requestData = {
        body: { data: "test" },
        params: { id: "123" },
        headers: { authorization: "Bearer token" },
        ip: "192.168.1.1",
        socket: { remoteAddress: "192.168.1.1" } as any,
      };

      mockRequest = { ...requestData };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
      } as any);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authenticate).toHaveBeenCalledWith({
        body: requestData.body,
        params: requestData.params,
        headers: requestData.headers,
        ip: requestData.ip,
        socket: requestData.socket,
      });
    });

    it("should handle different error status codes", async () => {
      const errorResponse = {
        statusCode: 403,
        body: { error: "Acesso negado" },
      };

      mockAuthMiddleware.authenticate.mockResolvedValue(errorResponse);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Acesso negado" });
    });

    it("should work with minimal request object", async () => {
      mockRequest = {};

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
      } as any);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authenticate).toHaveBeenCalledWith({
        body: undefined,
        params: undefined,
        headers: undefined,
        ip: undefined,
        socket: undefined,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("requireRoles", () => {
    it("should call next() when user has required role", () => {
      mockRequest.user = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue(mockRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN", "CHEFE"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authorize).toHaveBeenCalledWith([
        "ADMIN",
        "CHEFE",
      ]);
      expect(authorizeFn).toHaveBeenCalledWith({
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
        user: mockRequest.user,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", () => {
      mockRequest.user = undefined;

      const middleware = requireRoles(["ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Usuário não autenticado",
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockAuthMiddleware.authorize).not.toHaveBeenCalled();
    });

    it("should return error response when authorization fails", () => {
      mockRequest.user = {
        userId: "user-123",
        sessionId: "session-123",
        role: "BOMBEIRO",
        militaryId: "military-123",
      };

      const errorResponse = {
        statusCode: 403,
        body: { error: "Acesso negado" },
      };

      const authorizeFn = jest.fn().mockReturnValue(errorResponse);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Acesso negado" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should work with multiple allowed roles", () => {
      mockRequest.user = {
        userId: "user-123",
        sessionId: "session-123",
        role: "CHEFE",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue(mockRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN", "CHEFE", "ACA"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authorize).toHaveBeenCalledWith([
        "ADMIN",
        "CHEFE",
        "ACA",
      ]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should work with single role", () => {
      mockRequest.user = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue(mockRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authorize).toHaveBeenCalledWith(["ADMIN"]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should pass complete request data to authorization", () => {
      const userData = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const requestData = {
        body: { data: "test" },
        params: { id: "456" },
        headers: { "content-type": "application/json" },
        ip: "192.168.1.100",
        socket: { remoteAddress: "192.168.1.100" } as any,
        user: userData,
      };

      mockRequest = { ...requestData };

      const authorizeFn = jest.fn().mockReturnValue(mockRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(authorizeFn).toHaveBeenCalledWith({
        body: requestData.body,
        params: requestData.params,
        headers: requestData.headers,
        ip: requestData.ip,
        socket: requestData.socket,
        user: requestData.user,
      });
    });
  });

  describe("requireAuthWithRoles", () => {
    it("should authenticate and authorize successfully", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authenticatedRequest = { user: mockUser };

      mockAuthMiddleware.authenticate.mockResolvedValue(
        authenticatedRequest as any,
      );

      const authorizeFn = jest.fn().mockReturnValue(authenticatedRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles(["ADMIN", "CHEFE"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authenticate).toHaveBeenCalledWith({
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
      });

      expect(mockAuthMiddleware.authorize).toHaveBeenCalledWith([
        "ADMIN",
        "CHEFE",
      ]);
      expect(authorizeFn).toHaveBeenCalledWith(authenticatedRequest);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("should return error when authentication fails", async () => {
      const authError = {
        statusCode: 401,
        body: { error: "Token inválido" },
      };

      mockAuthMiddleware.authenticate.mockResolvedValue(authError);

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockAuthMiddleware.authorize).not.toHaveBeenCalled();
    });

    it("should return error when authorization fails", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "BOMBEIRO",
        militaryId: "military-123",
      };

      const authenticatedRequest = { user: mockUser };

      mockAuthMiddleware.authenticate.mockResolvedValue(
        authenticatedRequest as any,
      );

      const authzError = {
        statusCode: 403,
        body: { error: "Acesso negado" },
      };

      const authorizeFn = jest.fn().mockReturnValue(authzError);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Acesso negado" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when authentication throws exception", async () => {
      mockAuthMiddleware.authenticate.mockRejectedValue(new Error("JWT error"));

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Falha na autenticação/autorização",
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockAuthMiddleware.authorize).not.toHaveBeenCalled();
    });

    it("should work with different role combinations", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ACA",
        militaryId: "military-123",
      };

      const authenticatedRequest = { user: mockUser };

      mockAuthMiddleware.authenticate.mockResolvedValue(
        authenticatedRequest as any,
      );

      const authorizeFn = jest.fn().mockReturnValue(authenticatedRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles(["ADMIN", "CHEFE", "ACA"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authorize).toHaveBeenCalledWith([
        "ADMIN",
        "CHEFE",
        "ACA",
      ]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should execute authentication before authorization", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authenticatedRequest = { user: mockUser };

      let authOrder: string[] = [];

      mockAuthMiddleware.authenticate.mockImplementation(async () => {
        authOrder.push("authenticate");
        return authenticatedRequest as any;
      });

      const authorizeFn = jest.fn().mockImplementation(() => {
        authOrder.push("authorize");
        return authenticatedRequest;
      });
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(authOrder).toEqual(["authenticate", "authorize"]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should pass authenticated request to authorization", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authenticatedRequest = {
        user: mockUser,
        body: { data: "test" },
        params: { id: "123" },
      };

      mockAuthMiddleware.authenticate.mockResolvedValue(
        authenticatedRequest as any,
      );

      const authorizeFn = jest.fn().mockReturnValue(authenticatedRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(authorizeFn).toHaveBeenCalledWith(authenticatedRequest);
    });

    it("should handle empty roles array", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "BOMBEIRO",
        militaryId: "military-123",
      };

      const authenticatedRequest = { user: mockUser };

      mockAuthMiddleware.authenticate.mockResolvedValue(
        authenticatedRequest as any,
      );

      const authorizeFn = jest.fn().mockReturnValue(authenticatedRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles([]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockAuthMiddleware.authorize).toHaveBeenCalledWith([]);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("middleware integration", () => {
    it("should work with Express middleware chain", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      } as any);

      // Simulate Express middleware chain
      let middlewareExecuted = false;
      const nextMiddleware = jest.fn(() => {
        middlewareExecuted = true;
      });

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextMiddleware,
      );

      expect(middlewareExecuted).toBe(true);
      expect(mockRequest.user).toEqual(mockUser);
    });

    it("should maintain request object integrity", async () => {
      const originalRequest = {
        body: { originalData: "test" },
        params: { originalParam: "value" },
        headers: { "original-header": "header-value" },
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" } as any,
        originalProperty: "should-remain",
      };

      mockRequest = { ...originalRequest };

      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      } as any);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      // Check that original properties are maintained
      expect(mockRequest.body).toEqual(originalRequest.body);
      expect(mockRequest.params).toEqual(originalRequest.params);
      expect(mockRequest.headers).toEqual(originalRequest.headers);
      expect((mockRequest as any).originalProperty).toBe("should-remain");

      // Check that user was added
      expect(mockRequest.user).toEqual(mockUser);
    });

    it("should handle concurrent middleware calls", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      } as any);

      const requests = [
        { ...mockRequest },
        { ...mockRequest },
        { ...mockRequest },
      ];

      const responses = [
        { ...mockResponse },
        { ...mockResponse },
        { ...mockResponse },
      ];

      const nexts = [jest.fn(), jest.fn(), jest.fn()];

      const promises = requests.map((req, index) =>
        requireAuth(
          req as AuthenticatedRequest,
          responses[index] as Response,
          nexts[index],
        ),
      );

      await Promise.all(promises);

      // All should succeed
      nexts.forEach((next) => {
        expect(next).toHaveBeenCalledTimes(1);
      });

      requests.forEach((req) => {
        expect(req.user).toEqual(mockUser);
      });
    });
  });

  describe("type safety and interfaces", () => {
    it("should work with AuthenticatedRequest interface", async () => {
      const typedRequest = {
        body: {},
        params: {},
        headers: {},
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1" } as any,
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
      } as AuthenticatedRequest;

      const authorizeFn = jest.fn().mockReturnValue(typedRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN"]);
      middleware(typedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle requests without optional properties", async () => {
      const minimalRequest = {} as AuthenticatedRequest;

      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
      } as any);

      await requireAuth(minimalRequest, mockResponse as Response, mockNext);

      expect(mockAuthMiddleware.authenticate).toHaveBeenCalledWith({
        body: undefined,
        params: undefined,
        headers: undefined,
        ip: undefined,
        socket: undefined,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling edge cases", () => {
    it("should handle authentication returning undefined", async () => {
      mockAuthMiddleware.authenticate.mockResolvedValue(undefined as any);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Falha na autenticação",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle authorization returning null result", () => {
      mockRequest.user = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue({
        statusCode: 500,
        body: { error: "Internal authorization error" },
      });
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireRoles(["ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Internal authorization error",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle mixed authentication and authorization flow errors", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "BOMBEIRO",
        militaryId: "military-123",
      };

      // Auth succeeds
      mockAuthMiddleware.authenticate.mockResolvedValue({
        user: mockUser,
      } as any);

      // But authorization fails
      const authorizeFn = jest.fn().mockReturnValue({
        statusCode: 403,
        body: { error: "Insufficient privileges" },
      });
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Insufficient privileges",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("role-based access scenarios", () => {
    it("should allow ADMIN access to all restricted endpoints", () => {
      mockRequest.user = {
        userId: "admin-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue(mockRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const adminMiddleware = requireRoles(["ADMIN"]);
      adminMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should allow CHEFE access to CHEFE and lower roles", () => {
      mockRequest.user = {
        userId: "chefe-123",
        sessionId: "session-123",
        role: "CHEFE",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue(mockRequest);
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const chefeMiddleware = requireRoles(["ADMIN", "CHEFE"]);
      chefeMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should deny BOMBEIRO access to ADMIN-only endpoints", () => {
      mockRequest.user = {
        userId: "bombeiro-123",
        sessionId: "session-123",
        role: "BOMBEIRO",
        militaryId: "military-123",
      };

      const authorizeFn = jest.fn().mockReturnValue({
        statusCode: 403,
        body: { error: "Acesso negado" },
      });
      mockAuthMiddleware.authorize.mockReturnValue(authorizeFn);

      const adminOnlyMiddleware = requireRoles(["ADMIN"]);
      adminOnlyMiddleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
