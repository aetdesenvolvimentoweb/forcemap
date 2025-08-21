import express, { Express } from "express";

import { RouteRegistry } from "@presentation/protocols";

import { setupMiddlewares } from "./middlewares.config";
import { setupRoutes } from "./routes.config";
import { setupSwagger } from "./swagger.setup";

const app: Express = express();

export const setupApp = (routeRegistry: RouteRegistry): Express => {
  setupMiddlewares(app);
  setupSwagger(app);
  setupRoutes(app, routeRegistry);

  return app;
};

export { app };
