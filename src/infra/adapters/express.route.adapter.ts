// src/main/adapters/expressRouteAdapter.ts
import { Request, Response } from "express";

import type { LoggerProtocol } from "../../application/protocols";
import type {
  ControllerProtocol,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";

export const expressRouteAdapter = (
  controller: ControllerProtocol,
  logger: LoggerProtocol,
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const httpRequest: HttpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      };

      const httpResponse: HttpResponse = await controller.handle(httpRequest);

      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      logger.error("Express route adapter error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        path: req.url,
        method: req.method,
      });
      res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};
