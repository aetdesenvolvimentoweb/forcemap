import { Request, Response, Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateMilitaryRankController,
  makeListAllMilitaryRankController,
} from "../factories/controllers";

const militaryRankRoutes = Router();

militaryRankRoutes.post(
  "/",
  expressRouteAdapter(makeCreateMilitaryRankController()),
);
militaryRankRoutes.get(
  "/",
  expressRouteAdapter(makeListAllMilitaryRankController()),
);
militaryRankRoutes.get("/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pendente de desenvolvimento" });
});
militaryRankRoutes.delete("/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pendente de desenvolvimento" });
});
militaryRankRoutes.put("/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pendente de desenvolvimento" });
});

export default militaryRankRoutes;
