import { MilitaryPublic } from "@/backend/domain/entities";
import {
  AddMilitaryUsecase,
  DeleteMilitaryUsecase,
  GetAllMilitaryUsecase,
  GetMilitaryByIdUsecase,
  UpdateMilitaryProfileUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase,
    DeleteMilitaryUsecase,
    GetAllMilitaryUsecase,
    UpdateMilitaryProfileUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
