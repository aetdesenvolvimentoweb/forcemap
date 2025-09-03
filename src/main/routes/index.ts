import { Router } from "express";

import militaryRoutes from "./military.routes";
import militaryRankRoutes from "./military-rank.routes";
import vehicleRoutes from "./vehicle.routes";

const routes = Router();

routes.use("/api/v1", militaryRankRoutes);
routes.use("/api/v1", militaryRoutes);
routes.use("/api/v1", vehicleRoutes);

export default routes;
