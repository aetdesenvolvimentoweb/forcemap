import pino from "pino";

import type { Logger } from "@application/protocols";

/**
 * 🏗️ INFRA LAYER - Implementação do Logger com Pino.js
 *
 * Responsabilidade:
 * - Implementar o protocolo Logger usando Pino.js
 * - Configurar logger estruturado para produção e desenvolvimento
 * - Isolar dependência externa (Pino) da arquitetura
 *
 * Esta implementação fica na INFRA porque:
 * - Conhece Pino.js especificamente (tecnologia externa)
 * - Implementa conversão entre protocolo e biblioteca
 * - Pode ser substituída por WinstonLogger, BunyanLogger, etc.
 */
export class PinoLogger implements Logger {
  constructor(
    private readonly pinoInstance: pino.Logger = pino({
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:dd/mm/yyyy HH:MM:ss",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    }),
  ) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.pinoInstance.info(context ?? {}, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.pinoInstance.warn(context ?? {}, message);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.pinoInstance.error(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.pinoInstance.debug(context ?? {}, message);
  }

  child(bindings: Record<string, unknown>): Logger {
    return new PinoLogger(this.pinoInstance.child(bindings));
  }
}
