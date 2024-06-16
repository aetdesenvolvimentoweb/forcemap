import { UpdateProps } from "../../entities";

export interface UpdateMilitaryRankUsecase {
  update: (props: UpdateProps) => Promise<void>;
}
