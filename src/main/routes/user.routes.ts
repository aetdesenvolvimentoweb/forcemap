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
import { requireAuthWithRoles } from "../middlewares";

const userRoutes = Router();

// Todas as rotas de usuário requerem autenticação mínima
// Rotas que requerem permissão ADMIN
userRoutes.post(
  "/user",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeCreateUserController()),
);

userRoutes.delete(
  "/user/:id",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeDeleteUserController()),
);

userRoutes.patch(
  "/user/update-role/:id",
  requireAuthWithRoles(["admin"]),
  expressRouteAdapter(makeUpdateUserRoleController()),
);

// Rotas que requerem permissão ADMIN ou CHEFE
userRoutes.get("/user", expressRouteAdapter(makeListAllUserController()));

userRoutes.get(
  "/user/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeFindByIdUserController()),
);

userRoutes.patch(
  "/user/update-password/:id",
  requireAuthWithRoles(["admin", "chefe"]),
  expressRouteAdapter(makeUpdateUserPasswordController()),
);

export default userRoutes;
