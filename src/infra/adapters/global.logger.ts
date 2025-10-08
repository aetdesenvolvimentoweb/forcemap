import type { LoggerProtocol } from "../../application/protocols";

/**
 * Logger global da aplicação.
 *
 * DEPRECATED: Prefira usar injeção de dependência sempre que possível.
 * Este export é mantido apenas para compatibilidade com código legado.
 *
 * Para novos códigos, use makeGlobalLogger() da camada main.
 */
export let globalLogger: LoggerProtocol;

/**
 * Inicializa o logger global.
 * Deve ser chamado uma única vez no início da aplicação.
 *
 * @param logger - Instância do logger a ser usada globalmente
 */
export const initGlobalLogger = (logger: LoggerProtocol): void => {
  globalLogger = logger;
};
