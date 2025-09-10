import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateVehicleController,
  makeDeleteVehicleController,
  makeFindByIdVehicleController,
  makeListAllVehicleController,
  makeUpdateVehicleController,
} from "../factories/controllers";
import { requireAuthWithRoles } from "../middlewares";

const vehicleRoutes = Router();

vehicleRoutes.post(
  "/vehicle",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeCreateVehicleController()),
);
vehicleRoutes.get(
  "/vehicle",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeListAllVehicleController()),
);
vehicleRoutes.get(
  "/vehicle/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeFindByIdVehicleController()),
);
vehicleRoutes.delete(
  "/vehicle/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeDeleteVehicleController()),
);
vehicleRoutes.put(
  "/vehicle/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeUpdateVehicleController()),
);

export default vehicleRoutes;
