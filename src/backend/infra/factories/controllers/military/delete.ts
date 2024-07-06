import { DeleteMilitaryController } from "@/backend/presentation/controllers";
import { makeDeleteMilitaryService } from "../../services/military";

export const makeDeleteMilitaryController = (): DeleteMilitaryController => {
  return new DeleteMilitaryController(makeDeleteMilitaryService());
};
