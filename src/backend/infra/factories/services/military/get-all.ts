import { GetAllMilitaryService } from "@/backend/data/services";
import { MilitaryPrismaRespository } from "@/backend/infra/adapters/prisma/repositories";

export const makeGetAllMilitaryService = (): GetAllMilitaryService => {
  const repository = new MilitaryPrismaRespository();

  return new GetAllMilitaryService(repository);
};
