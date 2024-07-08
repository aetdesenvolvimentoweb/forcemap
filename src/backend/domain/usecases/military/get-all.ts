import { MilitaryPublic } from "../../entities";

export interface GetAllMilitaryUsecase {
  getAll: () => Promise<MilitaryPublic[]>;
}
