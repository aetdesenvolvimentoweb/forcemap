import { MilitaryPublic } from "../../entities";

export interface GetMilitaryByRgUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
