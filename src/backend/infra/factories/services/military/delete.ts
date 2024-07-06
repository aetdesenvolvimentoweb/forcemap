import { DeleteMilitaryService } from "@/backend/data/services";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";

export const makeDeleteMilitaryService = (): DeleteMilitaryService => {
  const militaryRepository = new MilitaryPrismaRespository();
  const militaryRankRepository = new MilitaryRankPrismaRespository();

  return new DeleteMilitaryService({
    repository: militaryRepository,
  });
};
