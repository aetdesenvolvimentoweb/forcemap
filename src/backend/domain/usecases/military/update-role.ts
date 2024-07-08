import { UpdateMilitaryRoleProps } from "../../entities";

export interface UpdateMilitaryRoleUsecase {
  updateRole: (props: UpdateMilitaryRoleProps) => Promise<void>;
}
