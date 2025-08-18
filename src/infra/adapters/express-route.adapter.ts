import type { AppError } from "@domain/errors";

import { HttpResponseFactory } from "@presentation/factories";
import type { Controller, HttpRequest } from "@presentation/protocols";

import type { Request, Response } from "express";

/**
 * 🏗️ INFRA LAYER - Express Route Adapter
 *
 * Responsabilidade:
 * - Implementar integração específica com Express
 * - Converter entre Express Request/Response e nossos protocolos
 * - Isolar framework específico da PRESENTATION
 *
 * Este adapter fica na INFRA porque:
 * - Conhece Express especificamente (tecnologia externa)
 * - Implementa conversão entre protocolos
 * - Pode ser substituído por FastifyAdapter, KoaAdapter, etc.
 */

export const adaptExpressRoute = (controller: Controller<unknown, unknown>) => {
  return async (req: Request, res: Response): Promise<void> => {
    const httpResponseFactory = new HttpResponseFactory();

    try {
      // Converte Express Request para HttpRequest (nosso protocolo)
      const httpRequest: HttpRequest = {
        body: req.body,
        header: req.headers as Record<string, string>,
        query: Object.fromEntries(
          Object.entries(req.query).map(([key, value]) => [
            key,
            Array.isArray(value)
              ? value[0]?.toString() || ""
              : value?.toString() || "",
          ]),
        ),
        params: req.params,
      };

      // Executa o controller (independente de framework)
      const httpResponse = await controller.handle(httpRequest);

      // Converte HttpResponse para Express Response
      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      // Verifica se é um erro conhecido da aplicação (AppError)
      const isAppError = (error: unknown): error is AppError => {
        return (
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          "message" in error &&
          typeof (error as AppError).statusCode === "number" &&
          typeof (error as AppError).message === "string"
        );
      };

      // Trata erros conhecidos da aplicação vs erros inesperados do servidor
      const httpResponse = isAppError(error)
        ? httpResponseFactory.badRequest(error) // Erro de cliente (4xx)
        : httpResponseFactory.serverError(); // Erro interno do servidor (500)

      res.status(httpResponse.statusCode).json(httpResponse.body);
    }
  };
};
