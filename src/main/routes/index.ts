import { Router } from "express";

import authRoutes from "./auth.routes";
import militaryRoutes from "./military.routes";
import militaryRankRoutes from "./military-rank.routes";
import userRoutes from "./user.routes";
import vehicleRoutes from "./vehicle.routes";

const routes = Router();

routes.use("/api/v1", authRoutes);
routes.use("/api/v1", militaryRoutes);
routes.use("/api/v1", militaryRankRoutes);
routes.use("/api/v1", vehicleRoutes);
routes.use("/api/v1", userRoutes);

export default routes;
