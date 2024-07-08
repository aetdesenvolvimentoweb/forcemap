import { UpdateMilitaryRoleController } from "@/backend/presentation/controllers";
import { makeUpdateMilitaryRoleService } from "../../services/military";

export const makeUpdateMilitaryRoleController =
  (): UpdateMilitaryRoleController => {
    return new UpdateMilitaryRoleController(makeUpdateMilitaryRoleService());
  };
