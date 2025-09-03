import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
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
  expressRouteAdapter(makeCreateVehicleController()),
);
vehicleRoutes.get(
  "/vehicle",
  expressRouteAdapter(makeListAllVehicleController()),
);
vehicleRoutes.get(
  "/vehicle/:id",
  expressRouteAdapter(makeFindByIdVehicleController()),
);
vehicleRoutes.delete(
  "/vehicle/:id",
  expressRouteAdapter(makeDeleteVehicleController()),
);
vehicleRoutes.put(
  "/vehicle/:id",
  expressRouteAdapter(makeUpdateVehicleController()),
);

export default vehicleRoutes;
