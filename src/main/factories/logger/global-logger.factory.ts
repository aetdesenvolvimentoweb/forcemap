import { LoggerProtocol } from "../../../application/protocols";
import { PinoLoggerAdapter } from "../../../infra/adapters/pino.logger.adapter";

let globalLoggerInstance: LoggerProtocol | null = null;

/**
 * Factory para criar ou retornar a instância global do logger.
 * Usa singleton pattern para garantir uma única instância na aplicação.
 */
export const makeGlobalLogger = (): LoggerProtocol => {
  if (!globalLoggerInstance) {
    globalLoggerInstance = new PinoLoggerAdapter({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "development" &&
        process.env.LOG_PRETTY === "true"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    });
  }

  return globalLoggerInstance;
};
