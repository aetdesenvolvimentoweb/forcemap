import { UserRole } from "../../entities";

export interface DeleteMilitaryUseCase {
  delete(id: string, requestingUserRole?: UserRole): Promise<void>;
}
