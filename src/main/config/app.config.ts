import express from "express";
import type { Express } from "express";

import { RouteRegistry } from "@presentation/protocols";

import { setupMiddlewares } from "./middlewares.config";
import { setupRoutes } from "./routes.config";
import { setupSwagger } from "./swagger.setup";

export const setupApp = (app: Express, routeRegistry: RouteRegistry): void => {
  // Configuração de middlewares globais
  setupMiddlewares(app);

  // Configuração de rotas via RouteRegistry
  setupRoutes(app, routeRegistry);

  // Configuração do Swagger
  setupSwagger(app);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: "Route not found",
      message: "The requested resource does not exist",
    });
  });

  // Global error handler
  app.use(
    (
      error: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    },
  );
};
