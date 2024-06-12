import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeAddMilitaryRankService = (): AddMilitaryRankService => {
  const validator = new MilitaryRankValidator();
  const repository = new MilitaryRankPrismaRespository();

  return new AddMilitaryRankService({ repository, validator });
};
