import {
  AddMilitaryUsecase,
  GetMilitaryByIdUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase {}
