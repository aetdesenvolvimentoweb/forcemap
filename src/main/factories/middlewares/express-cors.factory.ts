import {
  corsAuto,
  corsDev,
  corsProd,
} from "../../../infra/adapters/middlewares/express-cors.middleware";
import { makeGlobalLogger } from "../logger";

/**
 * Factory para criar middleware CORS do Express.
 *
 * Responsabilidade de MAIN:
 * - Compõe logger com adapter CORS (infra)
 * - Fornece funções pré-configuradas
 */
export const makeExpressCorsMiddleware = () => {
  const logger = makeGlobalLogger();

  return {
    corsAuto: () => corsAuto(logger),
    corsDev: () => corsDev(logger),
    corsProd: () => corsProd(logger),
  };
};
