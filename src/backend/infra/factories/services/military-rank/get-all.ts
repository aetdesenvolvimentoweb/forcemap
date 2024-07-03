import { GetAllMilitaryRanksService } from "@/backend/data/services/military-rank/get-all";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";

export const makeGetAllMilitaryRanksService =
  (): GetAllMilitaryRanksService => {
    const repository = new MilitaryRankPrismaRespository();

    return new GetAllMilitaryRanksService(repository);
  };
