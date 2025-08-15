import express from "express";

import { RouteRegistry } from "@presentation/protocols";

import { setupMiddlewares } from "./middlewares.config";
import { setupRoutes } from "./routes.config";

import type { Express } from "express";

export const setupApp = (app: Express, routeRegistry: RouteRegistry): void => {
  // Configuração de middlewares globais
  setupMiddlewares(app);

  // Configuração de rotas via RouteRegistry
  setupRoutes(app, routeRegistry);

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

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
      console.error("🚨 Unhandled error:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    },
  );
};
