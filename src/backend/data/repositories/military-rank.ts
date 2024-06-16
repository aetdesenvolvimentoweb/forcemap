import { MilitaryRank } from "@/backend/domain/entities";
import {
  AddMilitaryRankUsecase,
  DeleteMilitaryRankUsecase,
  GetMilitaryRankByIdUsecase,
  UpdateMilitaryRankUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRankRepository
  extends AddMilitaryRankUsecase,
    DeleteMilitaryRankUsecase,
    GetMilitaryRankByIdUsecase,
    UpdateMilitaryRankUsecase {
  getByAbbreviatedName: (
    abbreviatedName: string
  ) => Promise<MilitaryRank | null>;
}
