import { NextFunction, Request, Response } from "express";

import { SeedManager } from "../seed/seed.manager";

export const ensureSeedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const seedManager = SeedManager.getInstance();
    const status = seedManager.getStatus();

    // Se já foi seeded, continue
    if (status.isSeeded) {
      return next();
    }

    // Se está em processo de seeding, aguarde
    console.log("⏳ Waiting for database seed to complete...");
    await seedManager.ensureSeeded();

    next();
  } catch (error) {
    console.error("❌ Seed middleware error:", error);
    res.status(503).json({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
  }
};
