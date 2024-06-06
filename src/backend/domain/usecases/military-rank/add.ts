import { MilitaryRankProps } from "../../entities";

export interface AddMilitaryRankUsecase {
  add: (props: MilitaryRankProps) => Promise<void>;
}
