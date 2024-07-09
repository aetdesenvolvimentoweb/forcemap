import { UpdateMilitaryPasswordService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";

export const makeUpdateMilitaryPasswordService =
  (): UpdateMilitaryPasswordService => {
    const militaryRepository = new MilitaryPrismaRespository();
    const militaryRankRepository = new MilitaryRankPrismaRespository();
    const idValidator = new MongoIdValidator();
    const validator = new MilitaryValidator({
      militaryRepository,
      militaryRankRepository,
      idValidator,
    });

    return new UpdateMilitaryPasswordService({
      repository: militaryRepository,
      validator,
    });
  };
