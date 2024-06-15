import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeAddMilitaryRankService = (): AddMilitaryRankService => {
  const repository = new MilitaryRankPrismaRespository();
  const idValidator = new MongoIdValidator();
  const validator = new MilitaryRankValidator({ idValidator, repository });

  return new AddMilitaryRankService({ repository, validator });
};
