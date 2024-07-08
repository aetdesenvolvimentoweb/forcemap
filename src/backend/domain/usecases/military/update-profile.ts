import { UpdateMilitaryProfileProps } from "../../entities";

export interface UpdateMilitaryProfileUsecase {
  updateProfile: (props: UpdateMilitaryProfileProps) => Promise<void>;
}
