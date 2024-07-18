import { Military } from "../../entities";

export interface GetMilitaryByRgUsecase {
  getByRg: (rg: number) => Promise<Military | null>;
}
