import { MilitaryRank } from "@/backend/domain/entities";
import {
  AddMilitaryRankUsecase,
  GetMilitaryRankByIdUsecase,
  UpdateMilitaryRankUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRankRepository
  extends AddMilitaryRankUsecase,
    GetMilitaryRankByIdUsecase,
    UpdateMilitaryRankUsecase {
  getByAbbreviatedName: (
    abbreviatedName: string
  ) => Promise<MilitaryRank | null>;
}
