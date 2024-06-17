import { MilitaryRank } from "@/backend/domain/entities";
import {
  AddMilitaryRankUsecase,
  DeleteMilitaryRankUsecase,
  GetAllMilitaryRanksUsecase,
  GetMilitaryRankByIdUsecase,
  UpdateMilitaryRankUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRankRepository
  extends AddMilitaryRankUsecase,
    DeleteMilitaryRankUsecase,
    GetAllMilitaryRanksUsecase,
    GetMilitaryRankByIdUsecase,
    UpdateMilitaryRankUsecase {
  getByAbbreviatedName: (
    abbreviatedName: string
  ) => Promise<MilitaryRank | null>;
}
