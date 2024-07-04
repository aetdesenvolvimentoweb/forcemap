import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MilitaryPrismaRespository } from "@/backend/infra/adapters/prisma/repositories";

export const makeAddMilitaryService = (): AddMilitaryService => {
  const militaryRepository = new MilitaryPrismaRespository();
  const validator = new MilitaryValidator({});

  return new AddMilitaryService({ validator, repository: militaryRepository });
};
