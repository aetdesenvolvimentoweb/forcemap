import { UpdateMilitaryProfileService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import { BcryptHashCompareAdapter } from "@/backend/infra/adapters/bcrypt/hash-compare";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";

export const makeUpdateMilitaryProfileService =
  (): UpdateMilitaryProfileService => {
    const militaryRepository = new MilitaryPrismaRespository();
    const militaryRankRepository = new MilitaryRankPrismaRespository();
    const idValidator = new MongoIdValidator();
    const hashCompare = new BcryptHashCompareAdapter();
    const validator = new MilitaryValidator({
      militaryRankRepository,
      militaryRepository,
      idValidator,
      hashCompare,
    });

    return new UpdateMilitaryProfileService({
      repository: militaryRepository,
      validator,
    });
  };
