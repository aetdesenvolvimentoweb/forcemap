import { MilitaryRank } from "../../entities";

export interface GetMilitaryRankByIdUsecase {
  getById: (id: string) => Promise<MilitaryRank | null>;
}
