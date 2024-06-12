import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeAddMilitaryRankService = (): AddMilitaryRankService => {
  const repository = new MilitaryRankPrismaRespository();

  return new AddMilitaryRankService(repository);
};
