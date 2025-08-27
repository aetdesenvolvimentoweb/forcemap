import { Router } from "express";

import homeRoutes from "./home.routes";
import militaryRankRoutes from "./military-rank.routes";

const routes = Router();

routes.use(homeRoutes);
routes.use("/military-rank", militaryRankRoutes);

export default routes;
