import express from "express";

import { setupApp, setupAllRoutes } from "./config";
import { DefaultRouteRegistry } from "./registries";

// Composition Root - ponto de entrada da aplicação
const bootstrap = async (): Promise<void> => {
  const app = express();
  const port = process.env.PORT ?? 3333;

  // 🎯 APLICAÇÃO PRÁTICA DO ROUTE REGISTRY:
  console.log("🚀 [MAIN] Inicializando Route Registry...");

  // 1. Criar instância do RouteRegistry
  const routeRegistry = new DefaultRouteRegistry();

  // 2. Registrar todas as rotas usando setup centralizado
  setupAllRoutes(routeRegistry);

  // 3. Setup da aplicação (middlewares, routes via registry, error handlers)
  setupApp(app, routeRegistry);

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/docs`);
    console.log(`🔗 Rotas ativas: ${routeRegistry.getRoutes().length}`);
  });
};

// Inicialização da aplicação
bootstrap().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});
