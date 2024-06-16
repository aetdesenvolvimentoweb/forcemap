import { UpdateMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeUpdateMilitaryRankService = (): UpdateMilitaryRankService => {
  const repository = new MilitaryRankPrismaRespository();

  return new UpdateMilitaryRankService(repository);
};
