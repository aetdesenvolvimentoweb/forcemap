import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeLoginController,
  makeLogoutController,
  makeRefreshTokenController,
} from "../factories/controllers/auth";
import { requireAuth } from "../middlewares";

const authRoutes = Router();

// Rota pública de login
authRoutes.post("/login", expressRouteAdapter(makeLoginController()));

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
