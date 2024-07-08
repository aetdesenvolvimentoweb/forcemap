import { UpdateMilitaryProfileController } from "@/backend/presentation/controllers";
import { makeUpdateMilitaryProfileService } from "../../services/military";

export const makeUpdateMilitaryProfileController =
  (): UpdateMilitaryProfileController => {
    return new UpdateMilitaryProfileController(
      makeUpdateMilitaryProfileService()
    );
  };
