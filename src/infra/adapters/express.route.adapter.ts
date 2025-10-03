// src/main/adapters/expressRouteAdapter.ts
import { Request, Response } from "express";

import type {
  ControllerProtocol,
  HttpRequest,
  HttpResponse,
} from "../../presentation/protocols";

export const expressRouteAdapter = (controller: ControllerProtocol) => {
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
      console.error("Express route adapter error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};
