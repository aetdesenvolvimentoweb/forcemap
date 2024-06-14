import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeAddMilitaryRankService = (): AddMilitaryRankService => {
  const repository = new MilitaryRankPrismaRespository();
  const validator = new MilitaryRankValidator(repository);

  return new AddMilitaryRankService({ repository, validator });
};
