import { MilitaryRank } from "@/backend/domain/entities";
import {
  AddMilitaryRankUsecase,
  GetMilitaryRankByIdUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRankRepository
  extends AddMilitaryRankUsecase,
    GetMilitaryRankByIdUsecase {
  getByAbbreviatedName: (
    abbreviatedName: string
  ) => Promise<MilitaryRank | null>;
}
