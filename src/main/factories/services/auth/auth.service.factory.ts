import { AuthService } from "../../../../application/services/auth/auth.service";
import { makePasswordHasher } from "../../hasher";
import {
  makeMilitaryRepository,
  makeSessionRepository,
  makeUserRepository,
} from "../../repositories";
import {
  makeUserSanitizationService,
  makeUserValidationService,
} from "../user";
import { makeJWTService } from "./jwt.service.factory";
import { makeRateLimiterService } from "./rate-limiter.service.factory";

export const makeAuthService = (): AuthService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const sessionRepository = makeSessionRepository();
  const userValidation = makeUserValidationService();
  const userSanitization = makeUserSanitizationService();
  const passwordHasher = makePasswordHasher();
  const jwtService = makeJWTService();
  const rateLimiter = makeRateLimiterService();

  return new AuthService({
    userRepository,
    sessionRepository,
    userValidation,
    userSanitization,
    passwordHasher,
    jwtService,
    rateLimiter,
  });
};
