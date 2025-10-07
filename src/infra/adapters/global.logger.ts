import { PinoLoggerAdapter } from "./pino.logger.adapter";

/**
 * Logger global da aplicação.
 *
 * Usar em locais onde injeção de dependência não é prática
 * (inicialização do servidor, middlewares de erro, seed, etc.)
 */
export const globalLogger = new PinoLoggerAdapter({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development" && process.env.LOG_PRETTY === "true"
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
