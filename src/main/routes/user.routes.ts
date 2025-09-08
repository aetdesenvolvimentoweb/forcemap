import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateUserController,
  makeDeleteUserController,
  makeFindByIdUserController,
  makeListAllUserController,
  makeUpdateUserPasswordController,
  makeUpdateUserRoleController,
} from "../factories/controllers";

const userRoutes = Router();

userRoutes.post("/user", expressRouteAdapter(makeCreateUserController()));
userRoutes.get("/user", expressRouteAdapter(makeListAllUserController()));
userRoutes.get("/user/:id", expressRouteAdapter(makeFindByIdUserController()));
userRoutes.delete("/user/:id", expressRouteAdapter(makeDeleteUserController()));
userRoutes.patch(
  "/user/update-role/:id",
  expressRouteAdapter(makeUpdateUserRoleController()),
);
userRoutes.patch(
  "/user/update-password/:id",
  expressRouteAdapter(makeUpdateUserPasswordController()),
);

export default userRoutes;
