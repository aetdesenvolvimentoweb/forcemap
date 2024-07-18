import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MongoIdValidator } from "@/backend/infra/adapters";
import { BcryptEncrypterAdapter } from "@/backend/infra/adapters/bcrypt/encrypter";
import { BcryptHashCompareAdapter } from "@/backend/infra/adapters/bcrypt/hash-compare";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";

export const makeAddMilitaryService = (): AddMilitaryService => {
  const militaryRankRepository = new MilitaryRankPrismaRespository();
  const militaryRepository = new MilitaryPrismaRespository();
  const idValidator = new MongoIdValidator();
  const hashCompare = new BcryptHashCompareAdapter();
  const validator = new MilitaryValidator({
    militaryRankRepository,
    militaryRepository,
    idValidator,
    hashCompare,
  });
  const encrypter = new BcryptEncrypterAdapter();

  return new AddMilitaryService({
    validator,
    repository: militaryRepository,
    encrypter,
  });
};
