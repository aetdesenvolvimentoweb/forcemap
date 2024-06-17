import { DeleteMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import {
  MilitaryRankPrismaRespository,
  MongoIdValidator,
} from "@/backend/infra/adapters";

export const makeDeleteMilitaryRankService = (): DeleteMilitaryRankService => {
  const repository = new MilitaryRankPrismaRespository();
  const idValidator = new MongoIdValidator();
  const validator = new MilitaryRankValidator({ repository, idValidator });

  return new DeleteMilitaryRankService({ repository, validator });
};
