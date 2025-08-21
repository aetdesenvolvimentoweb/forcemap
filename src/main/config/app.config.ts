import express, { Express, Request, Response, NextFunction } from "express";

import { RouteRegistry } from "@presentation/protocols";

import { setupMiddlewares } from "./middlewares.config";
import { setupRoutes } from "./routes.config";

const app: Express = express();

export const setupApp = (app: Express, routeRegistry: RouteRegistry): void => {
  setupMiddlewares(app);
  setupRoutes(app, routeRegistry);

  // 404 handler

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: "Route not found",
      message: "The requested resource does not exist",
    });
  });

  // Global error handler
  app.use(
    (
      err: Error & { status?: number; stack?: string },
      req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      const status = err.status || 500;
      const response: {
        error: string;
        message: string;
        stack?: string;
      } = {
        error: "Internal Server Error",
        message: "Something went wrong",
      };
      if (process.env.NODE_ENV === "development" && err.stack) {
        response.stack = err.stack;
      }
      res.status(status).json(response);
    },
  );
};

export { app };
