import { securityLogging } from "../../../infra/adapters/middlewares/express-security-logger.middleware";
import { makeGlobalLogger } from "../logger";

/**
 * Factory para criar middleware de security logging do Express.
 *
 * Responsabilidade de MAIN:
 * - Compõe logger com adapter de security logging (infra)
 */
export const makeExpressSecurityLoggingMiddleware = () => {
  const logger = makeGlobalLogger();
  return securityLogging(logger);
};
