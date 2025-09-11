import { Router } from "express";

import {
  ensureSeedMiddleware,
  expressRouteAdapter,
  requireAuth,
} from "../../infra/adapters";
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
