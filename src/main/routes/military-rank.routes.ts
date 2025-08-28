import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeListAllMilitaryRankController,
  makeListByIdMilitaryRankController,
  makeUpdateMilitaryRankController,
} from "../factories/controllers";

const militaryRankRoutes = Router();

militaryRankRoutes.post(
  "/military-rank",
  expressRouteAdapter(makeCreateMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank",
  expressRouteAdapter(makeListAllMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank/:id",
  expressRouteAdapter(makeListByIdMilitaryRankController()),
);
militaryRankRoutes.delete(
  "/military-rank/:id",
  expressRouteAdapter(makeDeleteMilitaryRankController()),
);
militaryRankRoutes.put(
  "/military-rank/:id",
  expressRouteAdapter(makeUpdateMilitaryRankController()),
);

export default militaryRankRoutes;
