import type { Controller } from "./controller.protocol";

export interface RouteHandler {
  execute(controller: Controller): Promise<void>;
}

export interface RouteConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  controller: Controller;
}

export interface RouteRegistry {
  register(config: RouteConfig): void;
  getRoutes(): RouteConfig[];
}
