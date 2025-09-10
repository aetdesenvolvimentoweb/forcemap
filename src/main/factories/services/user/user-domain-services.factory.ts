import { UserDomainServices } from "../../../../application/services/user/user-domain-services.interface";
import { makePasswordHasher } from "../../hasher";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeUserSanitizationService } from "./user-sanitization.service.factory";
import { makeUserValidationService } from "./user-validation.service.factory";

export const makeUserDomainServices = (): UserDomainServices => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const repository = makeUserRepository(militaryRepository);
  const validation = makeUserValidationService();
  const sanitization = makeUserSanitizationService();
  const passwordHasher = makePasswordHasher();

  return {
    repository,
    validation,
    sanitization,
    passwordHasher,
  };
};
