import { Router } from "express";

import homeRoutes from "./home.routes";
import militaryRankRoutes from "./military-rank.routes";

const routes = Router();

routes.use("/api/v1", homeRoutes);
routes.use("/api/v1", militaryRankRoutes);

export default routes;
