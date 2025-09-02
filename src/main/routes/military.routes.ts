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

militaryRoutes.post(
  "/military",
  expressRouteAdapter(makeCreateMilitaryController()),
);
militaryRoutes.get(
  "/military",
  expressRouteAdapter(makeListAllMilitaryController()),
);
militaryRoutes.get(
  "/military/:id",
  expressRouteAdapter(makeFindByIdMilitaryController()),
);
militaryRoutes.delete(
  "/military/:id",
  expressRouteAdapter(makeDeleteMilitaryController()),
);
militaryRoutes.put(
  "/military/:id",
  expressRouteAdapter(makeUpdateMilitaryController()),
);

export default militaryRoutes;
