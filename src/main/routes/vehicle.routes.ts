import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateVehicleController,
  makeDeleteVehicleController,
  makeFindByIdVehicleController,
  makeListAllVehicleController,
  makeUpdateVehicleController,
} from "../factories/controllers";
import { makeExpressAuthMiddleware } from "../factories/middlewares";

const vehicleRoutes = Router();
const { requireAuthWithRoles } = makeExpressAuthMiddleware();

vehicleRoutes.post(
  "/vehicle",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeCreateVehicleController()),
);
vehicleRoutes.get(
  "/vehicle",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeListAllVehicleController()),
);
vehicleRoutes.get(
  "/vehicle/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeFindByIdVehicleController()),
);
vehicleRoutes.delete(
  "/vehicle/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeDeleteVehicleController()),
);
vehicleRoutes.put(
  "/vehicle/:id",
  requireAuthWithRoles(["Admin", "Chefe", "ACA"]),
  expressRouteAdapter(makeUpdateVehicleController()),
);

export default vehicleRoutes;
