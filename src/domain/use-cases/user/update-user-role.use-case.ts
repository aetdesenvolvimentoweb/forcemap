import { UserRole } from "../../entities";

export interface UpdateUserRoleUseCase {
  updateUserRole(id: string, role: UserRole): Promise<void>;
}
