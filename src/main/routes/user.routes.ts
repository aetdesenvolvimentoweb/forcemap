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
import { makeGlobalLogger } from "../factories/logger";
import { makeExpressAuthMiddleware } from "../factories/middlewares";

const userRoutes = Router();
const { requireAuth, requireAuthWithRoles } = makeExpressAuthMiddleware();
const logger = makeGlobalLogger();

// Todas as rotas de usuário requerem autenticação mínima
// Rotas que requerem permissão ADMIN
userRoutes.post(
  "/user",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeCreateUserController(), logger),
);

userRoutes.delete(
  "/user/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeDeleteUserController(), logger),
);

userRoutes.patch(
  "/user/update-role/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeUpdateUserRoleController(), logger),
);

// Rotas que requerem permissão ADMIN ou CHEFE
userRoutes.get(
  "/user",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeListAllUserController(), logger),
);

userRoutes.get(
  "/user/:id",
  requireAuthWithRoles(["Admin", "Chefe"]),
  expressRouteAdapter(makeFindByIdUserController(), logger),
);

// Apenas o próprio usuário pode alterar sua senha (LGPD)
userRoutes.patch(
  "/user/update-password/:id",
  requireAuth,
  expressRouteAdapter(makeUpdateUserPasswordController(), logger),
);

export default userRoutes;
