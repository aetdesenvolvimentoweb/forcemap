import { RateLimiterProtocol } from "../../../../application/protocols/rate-limiter.protocol";
import { RateLimiterService } from "../../../../application/services/auth/rate-limiter.service";

export const makeRateLimiterService = (): RateLimiterProtocol => {
  return new RateLimiterService();
};
