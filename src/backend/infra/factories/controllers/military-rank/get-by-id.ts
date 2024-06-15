import { GetMilitaryRankByIdController } from "@/backend/presentation/controllers";
import { makeGetMilitaryRankByIdService } from "../../services";

export const makeGetMilitaryRankByIdController =
  (): GetMilitaryRankByIdController => {
    return new GetMilitaryRankByIdController(makeGetMilitaryRankByIdService());
  };
