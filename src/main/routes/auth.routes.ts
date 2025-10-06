import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import { requireAuth } from "../../infra/adapters/middlewares/express-auth.middleware";
import { ensureSeedMiddleware } from "../../infra/adapters/middlewares/express-seed.middleware";
import {
  makeLoginController,
  makeLogoutController,
  makeRefreshTokenController,
} from "../factories/controllers/auth";

const authRoutes = Router();

/**
 * Rotas de autenticação
 * Prefixo: /api/v1
 */

// POST /api/v1/login - Autenticação de usuário
authRoutes.post(
  "/login",
  ensureSeedMiddleware,
  expressRouteAdapter(makeLoginController()),
);

// POST /api/v1/refresh-token - Renovação de token de acesso
authRoutes.post(
  "/refresh-token",
  expressRouteAdapter(makeRefreshTokenController()),
);

// POST /api/v1/logout - Encerramento de sessão (protegido)
authRoutes.post(
  "/logout",
  requireAuth,
  expressRouteAdapter(makeLogoutController()),
);

export default authRoutes;
