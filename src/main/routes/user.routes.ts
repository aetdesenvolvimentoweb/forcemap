import { Router } from "express";

import { expressRouteAdapter } from "../../infra/adapters";
import {
  makeCreateUserController,
  makeDeleteUserController,
  makeFindByIdUserController,
  makeListAllUserController,
  makeUpdateUserController,
  makeUpdateUserPasswordController,
  makeUpdateUserRoleController,
} from "../factories/controllers";

const userRoutes = Router();

userRoutes.post("/user", expressRouteAdapter(makeCreateUserController()));
userRoutes.get("/user", expressRouteAdapter(makeListAllUserController()));
userRoutes.get("/user/:id", expressRouteAdapter(makeFindByIdUserController()));
userRoutes.delete("/user/:id", expressRouteAdapter(makeDeleteUserController()));
userRoutes.put("/user/:id", expressRouteAdapter(makeUpdateUserController()));
userRoutes.patch(
  "/user/:userId",
  expressRouteAdapter(makeUpdateUserRoleController()),
);
userRoutes.patch(
  "/user/updatePassword/:id",
  expressRouteAdapter(makeUpdateUserPasswordController()),
);

export default userRoutes;
