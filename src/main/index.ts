import express, { Express } from "express";

import { setupAllRoutes, setupApp } from "./config";
import { DefaultRouteRegistry } from "./registries";

// Composition Root - ponto de entrada da aplicação
const bootstrap = (): Express => {
  const app = express();
  const routeRegistry = new DefaultRouteRegistry();
  setupAllRoutes(routeRegistry);
  setupApp(app, routeRegistry);
  return app;
};

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  const app = bootstrap();
  const port = process.env.PORT ?? 3333;

  app.listen(port, () => {
    console.log(`🚀 API running on port http://localhost:${port}/api/v1`);
  });
}

// Export para Vercel
const app = bootstrap();
export default app;
