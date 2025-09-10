import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryController,
  makeDeleteMilitaryController,
  makeFindByIdMilitaryController,
  makeListAllMilitaryController,
  makeUpdateMilitaryController,
} from "../factories/controllers";

const militaryRoutes = Router();

// Operações críticas - apenas ADMIN
militaryRoutes.post(
  "/military",
  expressRouteAdapter(makeCreateMilitaryController()),
);

militaryRoutes.delete(
  "/military/:id",
  expressRouteAdapter(makeDeleteMilitaryController()),
);

militaryRoutes.put(
  "/military/:id",
  expressRouteAdapter(makeUpdateMilitaryController()),
);

// Operações de consulta - ADMIN e CHEFE
militaryRoutes.get(
  "/military",
  expressRouteAdapter(makeListAllMilitaryController()),
);

militaryRoutes.get(
  "/military/:id",
  expressRouteAdapter(makeFindByIdMilitaryController()),
);

export default militaryRoutes;
