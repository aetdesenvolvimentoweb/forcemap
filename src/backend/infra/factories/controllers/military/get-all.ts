import { GetAllMilitaryController } from "@/backend/presentation/controllers";
import { makeGetAllMilitaryService } from "../../services/military";

export const makeGetAllMilitaryController = (): GetAllMilitaryController => {
  return new GetAllMilitaryController(makeGetAllMilitaryService());
};
