import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryPrismaRespository } from "@/backend/infra/adapters/prisma/repositories";

export const makeAddMilitaryService = (): AddMilitaryService => {
  const militaryRepository = new MilitaryPrismaRespository();

  return new AddMilitaryService({ repository: militaryRepository });
};
