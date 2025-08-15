import { ExpressRouteBuilder } from "../builders/index.js";

import type { RouteRegistry } from "../../presentation/protocols/index.js";
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

  console.log("✅ [MAIN] Rotas configuradas com sucesso!");
};
