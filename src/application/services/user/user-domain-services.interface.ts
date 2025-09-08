import { UserRepository } from "../../../domain/repositories";
import { PasswordHasherProtocol } from "../../protocols";
import { UserSanitizationService } from "./user-sanitization.service";
import { UserValidationService } from "./user-validation.service";

export interface UserDomainServices {
  repository: UserRepository;
  validation: UserValidationService;
  sanitization: UserSanitizationService;
  passwordHasher: PasswordHasherProtocol;
}
