import { Request, Response, Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeListAllMilitaryRankController,
} from "../factories/controllers";
import { makeUpdateMilitaryRankController } from "../factories/controllers/military-rank/update.military-rank.controller.factory";

const militaryRankRoutes = Router();

militaryRankRoutes.post(
  "/military-rank",
  expressRouteAdapter(makeCreateMilitaryRankController()),
);
militaryRankRoutes.get(
  "/military-rank",
  expressRouteAdapter(makeListAllMilitaryRankController()),
);
militaryRankRoutes.get("/military-rank/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Ainda não desenvolvido" });
});
militaryRankRoutes.delete(
  "/military-rank/:id",
  expressRouteAdapter(makeDeleteMilitaryRankController()),
);
militaryRankRoutes.put(
  "/military-rank/:id",
  expressRouteAdapter(makeUpdateMilitaryRankController()),
);

export default militaryRankRoutes;
