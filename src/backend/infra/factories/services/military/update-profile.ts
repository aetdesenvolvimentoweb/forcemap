import { UpdateMilitaryProfileService } from "@/backend/data/services";
import { MilitaryPrismaRespository } from "@/backend/infra/adapters/prisma/repositories";

export const makeUpdateMilitaryProfileService =
  (): UpdateMilitaryProfileService => {
    const militaryRepository = new MilitaryPrismaRespository();

    return new UpdateMilitaryProfileService({
      repository: militaryRepository,
    });
  };
