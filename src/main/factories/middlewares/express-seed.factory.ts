import { createExpressSeedMiddleware } from "../../../infra/adapters/middlewares/express-seed.middleware";
import { SeedManager } from "../../seed/seed.manager";
import { makeGlobalLogger } from "../logger";

/**
 * Factory para criar middleware de seed do Express.
 *
 * Responsabilidade de MAIN:
 * - Compõe SeedManager com adapter Express (infra)
 * - Não viola inversão de dependências
 */
export const makeExpressSeedMiddleware = () => {
  const logger = makeGlobalLogger();
  const seedManager = SeedManager.getInstance(logger);

  return createExpressSeedMiddleware(seedManager, logger);
};
