import { RateLimitingService } from "../../../../application/services/auth/rate-limiting.service";
import { makeSecurityLogger } from "../../logger";
import { makeRateLimiter } from "../../rate-limiter";

export const makeRateLimitingService = (): RateLimitingService => {
  const rateLimiter = makeRateLimiter();
  const securityLogger = makeSecurityLogger();

  return new RateLimitingService({
    rateLimiter,
    securityLogger,
  });
};
