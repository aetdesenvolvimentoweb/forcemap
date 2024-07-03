import { GetAllMilitaryRanksController } from "@/backend/presentation/controllers/military-rank/get-all";
import { makeGetAllMilitaryRanksService } from "../../services/military-rank/get-all";

export const makeGetAllMilitaryRanksController =
  (): GetAllMilitaryRanksController => {
    return new GetAllMilitaryRanksController(makeGetAllMilitaryRanksService());
  };
