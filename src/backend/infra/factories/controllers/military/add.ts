import { AddMilitaryController } from "@/backend/presentation/controllers";
import { makeAddMilitaryService } from "../../services/military";

export const makeAddMilitaryController = (): AddMilitaryController => {
  return new AddMilitaryController(makeAddMilitaryService());
};
