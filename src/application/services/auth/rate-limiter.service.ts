import {
  RateLimiterProtocol,
  RateLimiterResult,
} from "../../protocols/rate-limiter.protocol";

interface AttemptRecord {
  attempts: number[];
  blockedUntil?: Date;
}

export class RateLimiterService implements RateLimiterProtocol {
  private readonly records: Map<string, AttemptRecord> = new Map();
  private readonly maxBlockDuration = 15 * 60 * 1000; // 15 minutes

  public readonly checkLimit = async (
    key: string,
    maxAttempts: number,
    windowMs: number,
  ): Promise<RateLimiterResult> => {
    const now = new Date();
    const record = this.getOrCreateRecord(key);

    // Check if currently blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil,
        totalAttempts: record.attempts.length,
      };
    }

    // Clean expired attempts
    const windowStart = now.getTime() - windowMs;
    record.attempts = record.attempts.filter(
      (attempt) => attempt > windowStart,
    );

    const currentAttempts = record.attempts.length;
    const remainingAttempts = Math.max(0, maxAttempts - currentAttempts);

    // If limit exceeded, block for specified duration
    if (currentAttempts >= maxAttempts) {
      record.blockedUntil = new Date(now.getTime() + this.maxBlockDuration);

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil,
        totalAttempts: currentAttempts,
      };
    }

    return {
      allowed: true,
      remainingAttempts,
      resetTime: new Date(now.getTime() + windowMs),
      totalAttempts: currentAttempts,
    };
  };

  public readonly recordAttempt = async (
    key: string,
    windowMs: number,
  ): Promise<void> => {
    const now = new Date();
    const record = this.getOrCreateRecord(key);

    // Add current attempt
    record.attempts.push(now.getTime());

    // Clean old attempts
    const windowStart = now.getTime() - windowMs;
    record.attempts = record.attempts.filter(
      (attempt) => attempt > windowStart,
    );

    this.records.set(key, record);
  };

  public readonly reset = async (key: string): Promise<void> => {
    this.records.delete(key);
  };

  public readonly isBlocked = async (key: string): Promise<boolean> => {
    const record = this.records.get(key);

    if (!record?.blockedUntil) {
      return false;
    }

    const now = new Date();
    return record.blockedUntil > now;
  };

  private readonly getOrCreateRecord = (key: string): AttemptRecord => {
    let record = this.records.get(key);

    if (!record) {
      record = { attempts: [] };
      this.records.set(key, record);
    }

    return record;
  };

  // Cleanup method to remove old records (should be called periodically)
  public readonly cleanup = async (): Promise<void> => {
    const now = new Date();
    const oneHourAgo = now.getTime() - 60 * 60 * 1000; // 1 hour ago

    for (const [key, record] of this.records.entries()) {
      // Remove records that have no recent attempts and are not blocked
      const hasRecentAttempts = record.attempts.some(
        (attempt) => attempt > oneHourAgo,
      );
      const isBlocked = record.blockedUntil && record.blockedUntil > now;

      if (!hasRecentAttempts && !isBlocked) {
        this.records.delete(key);
      }
    }
  };
}
