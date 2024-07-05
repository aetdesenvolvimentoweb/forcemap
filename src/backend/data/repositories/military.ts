import { MilitaryPublic } from "@/backend/domain/entities";
import {
  AddMilitaryUsecase,
  GetMilitaryByIdUsecase,
} from "@/backend/domain/usecases";

export interface MilitaryRepository
  extends AddMilitaryUsecase,
    GetMilitaryByIdUsecase {
  getByRg: (rg: number) => Promise<MilitaryPublic | null>;
}
