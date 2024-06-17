import { DeleteMilitaryRankController } from "@/backend/presentation/controllers";
import { makeDeleteMilitaryRankService } from "../../services";

export const makeDeleteMilitaryRankController =
  (): DeleteMilitaryRankController => {
    return new DeleteMilitaryRankController(makeDeleteMilitaryRankService());
  };
