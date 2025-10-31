import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryController,
  makeDeleteMilitaryController,
  makeFindByIdMilitaryController,
  makeListAllMilitaryController,
  makeUpdateMilitaryController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeExpressAuthMiddleware } from "../factories/middlewares";

const militaryRoutes = Router();
const { requireAuthWithRoles } = makeExpressAuthMiddleware();
const logger = makeGlobalLogger();

// Operações de consulta - ADMIN e CHEFE
militaryRoutes.post(
  "/military",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeCreateMilitaryController(), logger),
);

militaryRoutes.delete(
  "/military/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeDeleteMilitaryController(), logger),
);

militaryRoutes.put(
  "/military/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeUpdateMilitaryController(), logger),
);

militaryRoutes.get(
  "/military",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeListAllMilitaryController(), logger),
);

militaryRoutes.get(
  "/military/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeFindByIdMilitaryController(), logger),
);

export default militaryRoutes;
