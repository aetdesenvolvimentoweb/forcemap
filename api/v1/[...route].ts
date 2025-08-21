import { setupApp } from "../../src/main/config/app.config";
import { DefaultRouteRegistry } from "../../src/main/registries/route.registry";

// Criar uma instância da classe
const routeRegistry = new DefaultRouteRegistry();
const app = setupApp(routeRegistry);

export default app;
