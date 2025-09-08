import { UserRole } from "../../../../domain/entities";

export interface UserRoleValidatorProtocol {
  validate(role: UserRole): Promise<void>;
}
