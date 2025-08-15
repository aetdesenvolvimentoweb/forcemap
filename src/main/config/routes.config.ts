import type { RouteRegistry } from "@presentation/protocols";

import { ExpressRouteBuilder } from "../builders";

import type { Express } from "express";

export const setupRoutes = (
  app: Express,
  routeRegistry: RouteRegistry,
): void => {
  console.log("🚀 [MAIN] Configurando rotas...");

  // API prefix
  const apiPrefix = "/api/v1";

  // Criar builder para aplicar rotas do registry
  const routeBuilder = new ExpressRouteBuilder(app, routeRegistry);

  // Aplicar todas as rotas registradas com prefix
  routeBuilder.buildWithPrefix(apiPrefix);

  // API info endpoint (endpoint direto)
  app.get(`${apiPrefix}`, (_req, res) => {
    res.json({
      name: "ForceMap API",
      version: "1.0.0",
      status: "running",
      timestamp: new Date().toISOString(),
      registeredRoutes: routeRegistry.getRoutes().length,
    });
  });

  // Health check endpoint
  app.get(`${apiPrefix}/health`, (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  console.log("✅ [MAIN] Rotas configuradas com sucesso!");
};
