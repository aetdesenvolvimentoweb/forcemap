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
import { makeExpressAuthMiddleware } from "../factories/middlewares";

const userRoutes = Router();
const { requireAuthWithRoles } = makeExpressAuthMiddleware();

// Todas as rotas de usuário requerem autenticação mínima
// Rotas que requerem permissão ADMIN
userRoutes.post(
  "/user",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeCreateUserController()),
);

userRoutes.delete(
  "/user/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeDeleteUserController()),
);

userRoutes.patch(
  "/user/update-role/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeUpdateUserRoleController()),
);

// Rotas que requerem permissão ADMIN ou CHEFE
userRoutes.get("/user", expressRouteAdapter(makeListAllUserController()));

userRoutes.get(
  "/user/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeFindByIdUserController()),
);

userRoutes.patch(
  "/user/update-password/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeUpdateUserPasswordController()),
);

export default userRoutes;
