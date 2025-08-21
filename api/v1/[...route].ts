import express from "express";
import { setupApp } from "../../src/main/config/app.config";
import { DefaultRouteRegistry } from "../../src/main/registries/route.registry";

const routeRegistry = new DefaultRouteRegistry();
const app = express();
setupApp(app, routeRegistry);

export default app;
