import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeLoginController,
  makeLogoutController,
  makeRefreshTokenController,
} from "../factories/controllers/auth";
import {
  makeExpressAuthMiddleware,
  makeExpressSeedMiddleware,
} from "../factories/middlewares";

const authRoutes = Router();

// Middlewares compostos via factories (Main)
const { requireAuth } = makeExpressAuthMiddleware();
const ensureSeedMiddleware = makeExpressSeedMiddleware();

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
