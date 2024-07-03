import { MilitaryProps } from "../../entities";

export interface AddMilitaryUsecase {
  add: (props: MilitaryProps) => Promise<void>;
}
