import { DeleteMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";

export const makeDeleteMilitaryService = (): DeleteMilitaryService => {
  const militaryRepository = new MilitaryPrismaRespository();
  const militaryRankRepository = new MilitaryRankPrismaRespository();
  const idValidator = new MongoIdValidator();
  const validator = new MilitaryValidator({
    militaryRankRepository,
    militaryRepository,
    idValidator,
  });

  return new DeleteMilitaryService({
    repository: militaryRepository,
    validator,
  });
};
