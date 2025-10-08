import { NextFunction, Request, Response } from "express";

import { AuthMiddleware } from "../../../presentation/middlewares/auth.middleware";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
}

interface AuthHttpRequest {
  body?: unknown;
  params?: Record<string, string>;
  headers?: { [key: string]: string | string[] | undefined };
  ip?: string;
  socket?: { remoteAddress?: string };
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
}

/**
 * Adapter puro para middlewares de autenticação do Express.
 * Recebe AuthMiddleware por parâmetro e retorna funções Express.
 *
 * ✅ Não importa de Main
 * ✅ Não conhece factories
 * ✅ Adapter puro - apenas adaptação técnica
 */
export const createExpressAuthMiddleware = (authMiddleware: AuthMiddleware) => {
  /**
   * Middleware para autenticação obrigatória
   * Bloqueia a requisição se o token for inválido
   */
  const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const httpRequest: AuthHttpRequest = {
        body: req.body,
        params: req.params,
        headers: req.headers,
        ip: req.ip,
        socket: req.socket,
      };

      const result = await authMiddleware.authenticate(httpRequest);

      if ("statusCode" in result) {
        return res.status(result.statusCode).json(result.body);
      }

      req.user = result.user;
      next();
    } catch {
      return res.status(401).json({
        error: "Falha na autenticação",
      });
    }
  };

  /**
   * Middleware para autorização baseada em papéis
   * @param allowedRoles - Array com os papéis permitidos
   */
  const requireRoles = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuário não autenticado",
        });
      }

      const httpRequest: AuthHttpRequest = {
        body: req.body,
        params: req.params,
        headers: req.headers,
        ip: req.ip,
        socket: req.socket,
        user: req.user,
      };

      const result = authMiddleware.authorize(allowedRoles)(httpRequest);

      if ("statusCode" in result) {
        return res.status(result.statusCode).json(result.body);
      }

      next();
    };
  };

  /**
   * Middleware combinado: autenticação + autorização
   * @param allowedRoles - Array com os papéis permitidos
   */
  const requireAuthWithRoles = (allowedRoles: string[]) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        // Primeiro autentica
        const httpRequest: AuthHttpRequest = {
          body: req.body,
          params: req.params,
          headers: req.headers,
          ip: req.ip,
          socket: req.socket,
        };

        const authResult = await authMiddleware.authenticate(httpRequest);

        if ("statusCode" in authResult) {
          return res.status(authResult.statusCode).json(authResult.body);
        }

        req.user = authResult.user;

        // Depois autoriza
        const authzResult = authMiddleware.authorize(allowedRoles)(authResult);

        if ("statusCode" in authzResult) {
          return res.status(authzResult.statusCode).json(authzResult.body);
        }

        next();
      } catch {
        return res.status(401).json({
          error: "Falha na autenticação/autorização",
        });
      }
    };
  };

  return {
    requireAuth,
    requireRoles,
    requireAuthWithRoles,
  };
};
