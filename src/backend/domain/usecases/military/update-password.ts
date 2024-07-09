import { UpdateMilitaryPasswordProps } from "../../entities";

export interface UpdateMilitaryPasswordUsecase {
  updatePassword: (props: UpdateMilitaryPasswordProps) => Promise<void>;
}
