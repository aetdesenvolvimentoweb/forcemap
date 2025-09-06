import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import { makeAuthenticateUserController } from "../factories/controllers";

const authRoutes = Router();

authRoutes.post(
  "/login",
  expressRouteAdapter(makeAuthenticateUserController()),
);

export default authRoutes;
