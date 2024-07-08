import { MilitaryPublic } from "@/backend/domain/entities";
import {
  AddMilitaryUsecase,
  DeleteMilitaryUsecase,
  GetAllMilitaryUsecase,
  GetMilitaryByIdUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase,
    DeleteMilitaryUsecase,
    GetAllMilitaryUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
