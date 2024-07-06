import { GetMilitaryByIdController } from "@/backend/presentation/controllers";
import { makeGetMilitaryByIdService } from "../../services/military";

export const makeGetMilitaryByIdController = (): GetMilitaryByIdController => {
  return new GetMilitaryByIdController(makeGetMilitaryByIdService());
};
