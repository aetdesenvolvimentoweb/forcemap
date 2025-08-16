import type { Logger } from "@application/protocols";

import { PinoLogger } from "@infra/loggers";

/**
 * 🏭 Factory para Logger
 *
 * Responsabilidade:
 * - Criar instância do logger configurada para o ambiente
 * - Abstrair configuração específica do Pino
 * - Facilitar injeção de dependência
 */
export const makeLogger = (): Logger => {
  return new PinoLogger();
};
