import { MilitaryPublic } from "@/backend/domain/entities";
import {
  AddMilitaryUsecase,
  DeleteMilitaryUsecase,
  GetAllMilitaryUsecase,
  GetMilitaryByIdUsecase,
  UpdateMilitaryPasswordUsecase,
  UpdateMilitaryProfileUsecase,
  UpdateMilitaryRoleUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase,
    DeleteMilitaryUsecase,
    GetAllMilitaryUsecase,
    UpdateMilitaryProfileUsecase,
    UpdateMilitaryRoleUsecase,
    UpdateMilitaryPasswordUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
