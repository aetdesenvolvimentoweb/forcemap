import { MilitaryRepository } from "@/backend/data/repositories";
import { MilitaryProps } from "@/backend/domain/entities";
import {
  connectionError,
  operationError,
} from "@/backend/infra/helpers/prisma-errors";
import { prismaClient } from "../../prisma-client";

export class MilitaryPrismaRespository implements MilitaryRepository {
  private connectDB = async (): Promise<void> => {
    await prismaClient.$connect().catch(async () => {
      throw connectionError();
    });
  };

  public readonly add = async (props: MilitaryProps): Promise<void> => {
    await this.connectDB();
    await prismaClient.military
      .create({
        data: {
          militaryRankId: props.militaryRankId,
          rg: props.rg,
          name: props.name,
          password: props.password,
          role: props.role,
        },
      })
      .catch(async () => {
        throw operationError("criar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };
}
