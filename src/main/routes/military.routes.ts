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
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeCreateMilitaryController()),
);

militaryRoutes.delete(
  "/military/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeDeleteMilitaryController()),
);

militaryRoutes.put(
  "/military/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeUpdateMilitaryController()),
);

militaryRoutes.get(
  "/military",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeListAllMilitaryController()),
);

militaryRoutes.get(
  "/military/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeFindByIdMilitaryController()),
);

export default militaryRoutes;
