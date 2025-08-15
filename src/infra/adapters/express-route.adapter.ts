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
    try {
      // Converte Express Request para HttpRequest (nosso protocolo)
      const httpRequest: HttpRequest = {
        body: {
          data: req.body, // Os dados vêm do body do Express
        },
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

      console.log(
        `🏗️ [INFRA-EXPRESS] ${req.method} ${req.path} - Executando controller...`,
      );

      // Executa o controller (independente de framework)
      const httpResponse = await controller.handle(httpRequest);

      console.log(`✅ [INFRA-EXPRESS] Response ${httpResponse.statusCode}`);

      // Converte HttpResponse para Express Response
      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      console.error("🚨 [INFRA-EXPRESS] Erro no adaptador:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Erro interno do servidor",
      });
    }
  };
};
