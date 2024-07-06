import { MilitaryPublic } from "@/backend/domain/entities";
import {
  AddMilitaryUsecase,
  DeleteMilitaryUsecase,
  GetMilitaryByIdUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase,
    DeleteMilitaryUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
