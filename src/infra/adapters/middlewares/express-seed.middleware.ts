import { NextFunction, Request, Response } from "express";

import { SeedManager } from "../../../main/seed/seed.manager";
import { globalLogger } from "../global.logger";

export const ensureSeedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const handleSeed = async (): Promise<void> => {
    try {
      const seedManager = SeedManager.getInstance();
      const status = seedManager.getStatus();

      // Se já foi seeded, continue
      if (status.isSeeded) {
        return next();
      }

      // Se está em processo de seeding, aguarde
      await seedManager.ensureSeeded();

      next();
    } catch (error) {
      globalLogger.error("Seed middleware error", {
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
