import { Request, Response, Router } from "express";
import { expressRouteAdapter } from "src/infra/adapters";

import { makeCreateMilitaryRankController } from "../factories/controllers";

const militaryRankRoutes = Router();

militaryRankRoutes.post(
  "/military-rank",
  expressRouteAdapter(makeCreateMilitaryRankController()),
);
militaryRankRoutes.get("/military-rank", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pendente de desenvolvimento" });
});
militaryRankRoutes.get("/military-rank/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pendente de desenvolvimento" });
});
militaryRankRoutes.delete(
  "/military-rank/:id",
  (req: Request, res: Response) => {
    res.status(200).json({ message: "Pendente de desenvolvimento" });
  },
);
militaryRankRoutes.put("/military-rank/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pendente de desenvolvimento" });
});

export default militaryRankRoutes;
