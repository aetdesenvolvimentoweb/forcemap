import { Router } from "express";

import { API_VERSIONED_PATH } from "./api-version";
import authRoutes from "./auth.routes";
import militaryRoutes from "./military.routes";
import militaryRankRoutes from "./military-rank.routes";
import userRoutes from "./user.routes";
import vehicleRoutes from "./vehicle.routes";

const routes = Router();

// Todas as rotas são prefixadas com o versionamento da API
// Versão atual: /api/v1
routes.use(API_VERSIONED_PATH, authRoutes);
routes.use(API_VERSIONED_PATH, militaryRoutes);
routes.use(API_VERSIONED_PATH, militaryRankRoutes);
routes.use(API_VERSIONED_PATH, vehicleRoutes);
routes.use(API_VERSIONED_PATH, userRoutes);

export default routes;
