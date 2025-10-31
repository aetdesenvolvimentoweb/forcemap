import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeFindByIdMilitaryRankController,
  makeListAllMilitaryRankController,
  makeUpdateMilitaryRankController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeExpressAuthMiddleware } from "../factories/middlewares";

const militaryRankRoutes = Router();
const { requireAuthWithRoles } = makeExpressAuthMiddleware();
const logger = makeGlobalLogger();

// Operações críticas - apenas ADMIN
militaryRankRoutes.post(
  "/military-rank",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeCreateMilitaryRankController(), logger),
);
militaryRankRoutes.get(
  "/military-rank",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeListAllMilitaryRankController(), logger),
);
militaryRankRoutes.get(
  "/military-rank/:id",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeFindByIdMilitaryRankController(), logger),
);
militaryRankRoutes.delete(
  "/military-rank/:id",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeDeleteMilitaryRankController(), logger),
);
militaryRankRoutes.put(
  "/military-rank/:id",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeUpdateMilitaryRankController(), logger),
);

export default militaryRankRoutes;
