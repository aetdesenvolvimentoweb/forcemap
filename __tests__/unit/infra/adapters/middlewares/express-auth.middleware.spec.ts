import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "../../../../../src/infra/adapters";

// Mock do factory
const mockAuthMiddleware = {
  authenticate: jest.fn(),
  authorize: jest.fn(),
};

jest.mock(
  "../../../../../src/main/factories/middlewares/auth.middleware.factory",
  () => ({
    makeAuthMiddleware: () => mockAuthMiddleware,
  }),
);

// Importar depois do mock
import {
  requireAuth,
  requireAuthWithRoles,
  requireRoles,
} from "../../../../../src/infra/adapters";

describe("Express Auth Middleware", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: { test: "data" },
      params: { id: "123" },
      headers: { authorization: "Bearer token" },
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("requireAuth", () => {
    it("should authenticate successfully and call next", async () => {
      const mockUser = {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      mockAuthMiddleware.authenticate.mockResolvedValue({
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
        user: mockUser,
      });

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
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 401 when authentication fails with statusCode", async () => {
      mockAuthMiddleware.authenticate.mockResolvedValue({
        statusCode: 401,
        body: { error: "Token inválido" },
      });

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
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
    });

    it("should return 401 when authentication throws exception", async () => {
      mockAuthMiddleware.authenticate.mockRejectedValue(
        new Error("Database error"),
      );

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Falha na autenticação",
      });
    });
  });

  describe("requireRoles", () => {
    const mockUser = {
      userId: "user-123",
      sessionId: "session-123",
      role: "ADMIN",
      militaryId: "military-123",
    };

    it("should authorize successfully and call next", () => {
      mockRequest.user = mockUser;

      const mockAuthorizeFunction = jest.fn().mockReturnValue({
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
        user: mockUser,
      });
      mockAuthMiddleware.authorize.mockReturnValue(mockAuthorizeFunction);

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
      expect(mockAuthorizeFunction).toHaveBeenCalledWith({
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
        user: mockUser,
      });
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", () => {
      mockRequest.user = undefined;

      const middleware = requireRoles(["ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Usuário não autenticado",
      });
      expect(mockAuthMiddleware.authorize).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization fails with statusCode", () => {
      mockRequest.user = mockUser;

      const mockAuthorizeFunction = jest.fn().mockReturnValue({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });
      mockAuthMiddleware.authorize.mockReturnValue(mockAuthorizeFunction);

      const middleware = requireRoles(["SUPER_ADMIN"]);
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Acesso negado",
      });
    });
  });

  describe("requireAuthWithRoles", () => {
    const mockUser = {
      userId: "user-123",
      sessionId: "session-123",
      role: "ADMIN",
      militaryId: "military-123",
    };

    it("should authenticate and authorize successfully", async () => {
      const authenticatedRequest = {
        body: mockRequest.body,
        params: mockRequest.params,
        headers: mockRequest.headers,
        ip: mockRequest.ip,
        socket: mockRequest.socket,
        user: mockUser,
      };

      mockAuthMiddleware.authenticate.mockResolvedValue(authenticatedRequest);

      const mockAuthorizeFunction = jest
        .fn()
        .mockReturnValue(authenticatedRequest);
      mockAuthMiddleware.authorize.mockReturnValue(mockAuthorizeFunction);

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
      expect(mockAuthorizeFunction).toHaveBeenCalledWith(authenticatedRequest);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when authentication fails", async () => {
      mockAuthMiddleware.authenticate.mockResolvedValue({
        statusCode: 401,
        body: { error: "Token inválido" },
      });

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Token inválido",
      });
      expect(mockAuthMiddleware.authorize).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization fails", async () => {
      const authenticatedRequest = {
        user: mockUser,
      };

      mockAuthMiddleware.authenticate.mockResolvedValue(authenticatedRequest);

      const mockAuthorizeFunction = jest.fn().mockReturnValue({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });
      mockAuthMiddleware.authorize.mockReturnValue(mockAuthorizeFunction);

      const middleware = requireAuthWithRoles(["SUPER_ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Acesso negado",
      });
    });

    it("should return 401 when authentication throws exception", async () => {
      mockAuthMiddleware.authenticate.mockRejectedValue(
        new Error("Database error"),
      );

      const middleware = requireAuthWithRoles(["ADMIN"]);
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Falha na autenticação/autorização",
      });
    });
  });
});
