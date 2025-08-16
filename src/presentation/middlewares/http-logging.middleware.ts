import type { Logger } from "@application/protocols";

import type { Request, Response, NextFunction } from "express";

/**
 * 🚦 Middleware de Logging HTTP
 *
 * Responsabilidade:
 * - Logar início e fim de requisições HTTP
 * - Capturar informações relevantes (método, URL, status, tempo de resposta)
 * - Gerar IDs únicos de correlação para rastreamento
 * - Configurar contexto de request no logger
 */
export class HttpLoggingMiddleware {
  constructor(private readonly logger: Logger) {}

  handle = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const correlationId = this.generateCorrelationId();

    // Adicionar correlationId aos headers de resposta
    res.setHeader("X-Correlation-ID", correlationId);

    // Logger com contexto da request
    const requestLogger = this.logger.child({
      correlationId,
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    // Log início da requisição
    requestLogger.info("Request started");

    // Capturar quando a resposta termina
    res.on("finish", () => {
      const responseTime = Date.now() - startTime;
      const level = this.getLogLevel(res.statusCode);

      const responseContext = {
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        contentLength: res.get("Content-Length"),
      };

      requestLogger[level](
        `Request finished - ${res.statusCode} ${responseTime}ms`,
        responseContext,
      );
    });

    next();
  };

  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLogLevel(statusCode: number): "info" | "warn" | "error" {
    if (statusCode >= 500) return "error";
    if (statusCode >= 400) return "warn";
    return "info";
  }
}
