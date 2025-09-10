export interface RateLimiterResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
  totalAttempts: number;
}

export interface RateLimiterProtocol {
  checkLimit(
    key: string,
    maxAttempts: number,
    windowMs: number,
  ): Promise<RateLimiterResult>;
  recordAttempt(key: string, windowMs: number): Promise<void>;
  reset(key: string): Promise<void>;
  isBlocked(key: string): Promise<boolean>;
}
