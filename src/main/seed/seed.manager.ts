import { globalLogger } from "../../infra/adapters/global.logger";
import { makeDatabaseSeed } from "../factories/seed/database.seed.factory";

export class SeedManager {
  private static instance: SeedManager;
  private seedPromise: Promise<void> | null = null;
  private isSeeded = false;

  private constructor() {}

  public static getInstance(): SeedManager {
    if (!SeedManager.instance) {
      SeedManager.instance = new SeedManager();
    }
    return SeedManager.instance;
  }

  public async ensureSeeded(): Promise<void> {
    if (this.isSeeded) {
      return;
    }

    if (!this.seedPromise) {
      globalLogger.info("Starting database seed");
      this.seedPromise = this.runSeed();
    }

    await this.seedPromise;
  }

  private async runSeed(): Promise<void> {
    try {
      const databaseSeed = makeDatabaseSeed();
      await databaseSeed.run();
      this.isSeeded = true;
      globalLogger.info("Database seed completed successfully");
    } catch (error) {
      globalLogger.error("Database seed failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Reset promise so it can be retried
      this.seedPromise = null;
      throw error;
    }
  }

  public getStatus(): { isSeeded: boolean; isSeeding: boolean } {
    return {
      isSeeded: this.isSeeded,
      isSeeding: this.seedPromise !== null && !this.isSeeded,
    };
  }
}
