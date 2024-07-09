import { UpdateMilitaryPasswordController } from "@/backend/presentation/controllers";
import { makeUpdateMilitaryPasswordService } from "../../services/military";

export const makeUpdateMilitaryPasswordController =
  (): UpdateMilitaryPasswordController => {
    return new UpdateMilitaryPasswordController(
      makeUpdateMilitaryPasswordService()
    );
  };
