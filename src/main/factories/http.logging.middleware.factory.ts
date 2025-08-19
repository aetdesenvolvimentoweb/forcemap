import { HttpLoggingMiddleware } from "@presentation/middlewares";

import { makeLogger } from "./logger.factory";

/**
 * 🏭 Factory para Middleware de Logging HTTP
 *
 * Responsabilidade:
 * - Criar instância do middleware com suas dependências
 * - Conectar logger ao middleware
 */
export const makeHttpLoggingMiddleware = (): HttpLoggingMiddleware => {
  const logger = makeLogger();
  return new HttpLoggingMiddleware(logger);
};
