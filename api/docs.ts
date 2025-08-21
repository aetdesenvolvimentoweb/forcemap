import { setupApp } from "../src/main/config/app.config";
import { RouteRegistry } from "../src/presentation/protocols";

const emptyRegistry: RouteRegistry = {
  register: () => {},
  getRoutes: () => [],
};

const app = setupApp(emptyRegistry);

export default app;
