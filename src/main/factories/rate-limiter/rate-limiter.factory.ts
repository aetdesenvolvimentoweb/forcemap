import { RateLimiterProtocol } from "../../../application/protocols";
import { InMemoryRateLimiterAdapter } from "../../../infra/adapters";

export const makeRateLimiter = (): RateLimiterProtocol => {
  return new InMemoryRateLimiterAdapter();
};
