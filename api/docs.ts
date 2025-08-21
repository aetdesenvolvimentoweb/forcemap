import express from "express";
import { setupApp } from "../src/main/config/app.config";
import { RouteRegistry } from "../src/presentation/protocols";

const emptyRegistry: RouteRegistry = {
  register: () => {},
  getRoutes: () => [],
};

const app = express();
setupApp(app, emptyRegistry);

export default app;
