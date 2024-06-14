import { MilitaryRank } from "@/backend/domain/entities";
import { AddMilitaryRankUsecase } from "@/backend/domain/usecases";

export interface MilitaryRankRepository extends AddMilitaryRankUsecase {
  getByAbbreviatedName: (
    abbreviatedName: string
  ) => Promise<MilitaryRank | null>;
}
