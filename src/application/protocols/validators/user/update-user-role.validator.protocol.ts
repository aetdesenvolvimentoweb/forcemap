import { UserRole } from "../../../../domain/entities";

export interface UpdateUserRoleValidatorProtocol {
  validate(role: UserRole): Promise<void>;
}
