import { AddMilitaryRankController } from "@/backend/presentation/controllers";
import { makeAddMilitaryRankService } from "../../services/military-rank/add";

export const makeAddMilitaryRankController = (): AddMilitaryRankController => {
  return new AddMilitaryRankController(makeAddMilitaryRankService());
};
