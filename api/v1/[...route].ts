import { setupApp } from "../../src/main/config/app.config";
import { DefaultRouteRegistry } from "../../src/main/registries/route.registry";

const app = setupApp(DefaultRouteRegistry);

export default app;
