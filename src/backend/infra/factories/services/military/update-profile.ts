import { UpdateMilitaryProfileService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";

export const makeUpdateMilitaryProfileService =
  (): UpdateMilitaryProfileService => {
    const militaryRepository = new MilitaryPrismaRespository();
    const militaryRankRepository = new MilitaryRankPrismaRespository();
    const idValidator = new MongoIdValidator();
    const validator = new MilitaryValidator({
      idValidator,
      militaryRankRepository,
      militaryRepository,
    });

    return new UpdateMilitaryProfileService({
      repository: militaryRepository,
      validator,
    });
  };
