import { UserRole } from "../../../../domain/entities";

export interface MilitaryDeletionPermissionValidatorProtocol {
  validate(militaryId: string, requestingUserRole: UserRole): Promise<void>;
}
