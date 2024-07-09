import {
  AddMilitaryUsecase,
  DeleteMilitaryUsecase,
  GetAllMilitaryUsecase,
  GetMilitaryByIdUsecase,
  GetMilitaryByRgUsecase,
  GetMilitaryHashedPasswordUsecase,
  UpdateMilitaryPasswordUsecase,
  UpdateMilitaryProfileUsecase,
  UpdateMilitaryRoleUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase,
    GetMilitaryByRgUsecase,
    DeleteMilitaryUsecase,
    GetAllMilitaryUsecase,
    UpdateMilitaryProfileUsecase,
    UpdateMilitaryRoleUsecase,
    UpdateMilitaryPasswordUsecase,
    GetMilitaryHashedPasswordUsecase {}
