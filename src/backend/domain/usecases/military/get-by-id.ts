import { MilitaryPublic } from "../../entities";

export interface GetMilitaryByIdUsecase {
  getById: (id: string) => Promise<MilitaryPublic | null>;
}
