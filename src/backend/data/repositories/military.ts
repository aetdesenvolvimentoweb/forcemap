import { MilitaryPublic } from "@/backend/domain/entities";
import {
  AddMilitaryUsecase,
  DeleteMilitaryUsecase,
  GetAllMilitaryUsecase,
  GetMilitaryByIdUsecase,
  UpdateMilitaryProfileUsecase,
  UpdateMilitaryRoleUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase,
    DeleteMilitaryUsecase,
    GetAllMilitaryUsecase,
    UpdateMilitaryProfileUsecase,
    UpdateMilitaryRoleUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
