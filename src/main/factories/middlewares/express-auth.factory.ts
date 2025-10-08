import { createExpressAuthMiddleware } from "../../../infra/adapters/middlewares/express-auth.middleware";
import { makeAuthMiddleware } from "./auth.middleware.factory";

/**
 * Factory para criar middlewares de autenticação do Express.
 *
 * Responsabilidade de MAIN:
 * - Compõe AuthMiddleware (domain) com adapter Express (infra)
 * - Não viola inversão de dependências
 */
export const makeExpressAuthMiddleware = () => {
  const authMiddleware = makeAuthMiddleware();
  return createExpressAuthMiddleware(authMiddleware);
};
