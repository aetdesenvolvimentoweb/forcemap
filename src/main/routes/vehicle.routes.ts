import { Router } from "express";

import {
  expressRouteAdapter,
  requireAuthWithRoles,
} from "../../infra/adapters";
import {
  makeCreateVehicleController,
  makeDeleteVehicleController,
  makeFindByIdVehicleController,
  makeListAllVehicleController,
  makeUpdateVehicleController,
} from "../factories/controllers";

const vehicleRoutes = Router();

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
