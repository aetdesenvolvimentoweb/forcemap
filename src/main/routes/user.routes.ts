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
  requireAuthWithRoles(["ADMIN"]),
  expressRouteAdapter(makeCreateUserController()),
);

userRoutes.delete(
  "/user/:id",
  requireAuthWithRoles(["ADMIN"]),
  expressRouteAdapter(makeDeleteUserController()),
);

userRoutes.patch(
  "/user/update-role/:id",
  requireAuthWithRoles(["ADMIN"]),
  expressRouteAdapter(makeUpdateUserRoleController()),
);

// Rotas que requerem permissão ADMIN ou CHEFE
userRoutes.get(
  "/user",
  requireAuthWithRoles(["ADMIN", "CHEFE"]),
  expressRouteAdapter(makeListAllUserController()),
);

userRoutes.get(
  "/user/:id",
  requireAuthWithRoles(["ADMIN", "CHEFE"]),
  expressRouteAdapter(makeFindByIdUserController()),
);

userRoutes.patch(
  "/user/update-password/:id",
  requireAuthWithRoles(["ADMIN", "CHEFE"]),
  expressRouteAdapter(makeUpdateUserPasswordController()),
);

export default userRoutes;
