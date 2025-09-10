import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeFindByIdMilitaryRankController,
  makeListAllMilitaryRankController,
  makeUpdateMilitaryRankController,
} from "../factories/controllers";
import { requireAuthWithRoles } from "../middlewares";

const militaryRankRoutes = Router();

// Operações críticas - apenas ADMIN
militaryRankRoutes.post(
  "/military-rank",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeCreateMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeListAllMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank/:id",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeFindByIdMilitaryRankController()),
);
militaryRankRoutes.delete(
  "/military-rank/:id",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeDeleteMilitaryRankController()),
);
militaryRankRoutes.put(
  "/military-rank/:id",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeUpdateMilitaryRankController()),
);

export default militaryRankRoutes;
