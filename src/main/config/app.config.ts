import express from "express";

import { RouteRegistry } from "@presentation/protocols";

import { setupMiddlewares } from "./middlewares.config";
import { setupRoutes } from "./routes.config";
import { setupSwagger } from "./swagger.setup";

const app = express();

export const setupApp = (routeRegistry: RouteRegistry): express.Express => {
  setupMiddlewares(app);
  setupSwagger(app);
  setupRoutes(app, routeRegistry);

  return app;
};

export { app };
