import express from "express";

import { setupAllRoutes, setupApp } from "./config";
import { DefaultRouteRegistry } from "./registries";

import type { Express } from "express";

// Composition Root - ponto de entrada da aplicação
const bootstrap = (): Express => {
  const app = express();

  // 1. Criar instância do RouteRegistry
  const routeRegistry = new DefaultRouteRegistry();

  // 2. Registrar todas as rotas usando setup centralizado
  setupAllRoutes(routeRegistry);

  // 3. Setup da aplicação (middlewares, routes via registry, error handlers)
  setupApp(app, routeRegistry);

  return app;
};

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  const app = bootstrap();
  const port = process.env.PORT ?? 3333;

  app.listen(port, () => {
    console.log(`🚀 API running on port http://localhost:${port}`);
  });
}

// Export para Vercel
const app = bootstrap();
export default app;
