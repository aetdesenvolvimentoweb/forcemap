import { GetMilitaryRankByIdService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeGetMilitaryRankByIdService =
  (): GetMilitaryRankByIdService => {
    const repository = new MilitaryRankPrismaRespository();
    const idValidator = new MongoIdValidator();
    const validator = new MilitaryRankValidator({ repository, idValidator });

    return new GetMilitaryRankByIdService({ repository, validator });
  };
