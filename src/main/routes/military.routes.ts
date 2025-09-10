import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryController,
  makeDeleteMilitaryController,
  makeFindByIdMilitaryController,
  makeListAllMilitaryController,
  makeUpdateMilitaryController,
} from "../factories/controllers";
import { requireAuthWithRoles } from "../middlewares";

const militaryRoutes = Router();

// Operações de consulta - ADMIN e CHEFE
militaryRoutes.post(
  "/military",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeCreateMilitaryController()),
);

militaryRoutes.delete(
  "/military/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeDeleteMilitaryController()),
);

militaryRoutes.put(
  "/military/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeUpdateMilitaryController()),
);

militaryRoutes.get(
  "/military",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeListAllMilitaryController()),
);

militaryRoutes.get(
  "/military/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeFindByIdMilitaryController()),
);

export default militaryRoutes;
