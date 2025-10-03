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

// Rota pública de login - precisa do seed para funcionar
authRoutes.post(
  "/login",
  ensureSeedMiddleware,
  expressRouteAdapter(makeLoginController()),
);

// Rota pública para renovar token
authRoutes.post(
  "/refresh-token",
  expressRouteAdapter(makeRefreshTokenController()),
);

// Rota protegida de logout (requer autenticação)
authRoutes.post(
  "/logout",
  requireAuth,
  expressRouteAdapter(makeLogoutController()),
);

export default authRoutes;
