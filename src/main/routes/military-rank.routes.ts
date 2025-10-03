import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import { requireAuthWithRoles } from "../../infra/adapters/middlewares/express-auth.middleware";
import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeFindByIdMilitaryRankController,
  makeListAllMilitaryRankController,
  makeUpdateMilitaryRankController,
} from "../factories/controllers";

const militaryRankRoutes = Router();

// Operações críticas - apenas ADMIN
militaryRankRoutes.post(
  "/military-rank",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeCreateMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeListAllMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank/:id",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeFindByIdMilitaryRankController()),
);
militaryRankRoutes.delete(
  "/military-rank/:id",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeDeleteMilitaryRankController()),
);
militaryRankRoutes.put(
  "/military-rank/:id",
  requireAuthWithRoles(["Admin"]),
  expressRouteAdapter(makeUpdateMilitaryRankController()),
);

export default militaryRankRoutes;
