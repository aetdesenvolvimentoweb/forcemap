import { UpdateMilitaryRankController } from "@/backend/presentation/controllers";
import { makeUpdateMilitaryRankService } from "../../services";

export const makeUpdateMilitaryRankController =
  (): UpdateMilitaryRankController => {
    return new UpdateMilitaryRankController(makeUpdateMilitaryRankService());
  };
