import { RateLimiterProtocol } from "../../../../application/protocols/rate-limiter.protocol";
import { RateLimiterUtility } from "../../../../application/utilities/auth/rate-limiter.utility";

export const makeRateLimiterUtility = (): RateLimiterProtocol => {
  return new RateLimiterUtility();
};
