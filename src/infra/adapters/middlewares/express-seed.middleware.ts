import { NextFunction, Request, Response } from "express";

import { LoggerProtocol } from "../../../application/protocols";

/**
 * Interface para gerenciamento de seed
 */
export interface SeedManagerProtocol {
  ensureSeeded(): Promise<void>;
  getStatus(): { isSeeded: boolean; isSeeding: boolean };
}

/**
 * Adapter puro para middleware de seed do Express.
 * Recebe dependências por parâmetro e retorna função Express.
 *
 * ✅ Não importa de Main
 * ✅ Não conhece SeedManager concreto
 * ✅ Adapter puro - apenas adaptação técnica
 */
export const createExpressSeedMiddleware = (
  seedManager: SeedManagerProtocol,
  logger: LoggerProtocol,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const handleSeed = async (): Promise<void> => {
      try {
        const status = seedManager.getStatus();

        // Se já foi seeded, continue
        if (status.isSeeded) {
          return next();
        }

        // Se está em processo de seeding, aguarde
        await seedManager.ensureSeeded();

        next();
      } catch (error) {
        logger.error("Seed middleware error", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        res.status(503).json({
          error:
            "Service temporarily unavailable. Database initialization failed.",
        });
      }
    };

    // Executa async sem bloquear a assinatura do middleware
    handleSeed();
  };
};
