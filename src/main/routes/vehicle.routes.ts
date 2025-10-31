import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateVehicleController,
  makeDeleteVehicleController,
  makeFindByIdVehicleController,
  makeListAllVehicleController,
  makeUpdateVehicleController,
} from "../factories/controllers";
import { makeGlobalLogger } from "../factories/logger";
import { makeExpressAuthMiddleware } from "../factories/middlewares";

const vehicleRoutes = Router();
const { requireAuthWithRoles } = makeExpressAuthMiddleware();
const logger = makeGlobalLogger();

vehicleRoutes.post(
  "/vehicle",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeCreateVehicleController(), logger),
);
vehicleRoutes.get(
  "/vehicle",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeListAllVehicleController(), logger),
);
vehicleRoutes.get(
  "/vehicle/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeFindByIdVehicleController(), logger),
);
vehicleRoutes.delete(
  "/vehicle/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeDeleteVehicleController(), logger),
);
vehicleRoutes.put(
  "/vehicle/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeUpdateVehicleController(), logger),
);

export default vehicleRoutes;
