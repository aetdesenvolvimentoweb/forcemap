import { Router } from "express";

import homeRoutes from "./home.routes";
import militaryRoutes from "./military.routes";
import militaryRankRoutes from "./military-rank.routes";

const routes = Router();

routes.use("/api/v1", homeRoutes);
routes.use("/api/v1", militaryRankRoutes);
routes.use("/api/v1", militaryRoutes);

export default routes;
