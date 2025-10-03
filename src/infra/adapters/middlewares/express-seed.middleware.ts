import { NextFunction, Request, Response } from "express";

import { SeedManager } from "../../../main/seed/seed.manager";

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
      console.error("❌ Seed middleware error:", error);
      res.status(503).json({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
    }
  };

  // Executa async sem bloquear a assinatura do middleware
  handleSeed();
};
