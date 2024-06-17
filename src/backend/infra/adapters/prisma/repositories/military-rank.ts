import { MilitaryRankRepository } from "@/backend/data/repositories";
import {
  MilitaryRank,
  MilitaryRankProps,
  UpdateProps,
} from "@/backend/domain/entities";
import { connectionError, operationError } from "@/backend/infra/helpers";
import { prismaClient } from "../../prisma-client";

export class MilitaryRankPrismaRespository implements MilitaryRankRepository {
  private connectDB = async (): Promise<void> => {
    await prismaClient.$connect().catch(async () => {
      throw connectionError();
    });
  };

  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    await this.connectDB();

    await prismaClient.militaryRank
      .create({
        data: {
          order: props.order,
          abbreviatedName: props.abbreviatedName,
        },
      })
      .catch(async () => {
        throw operationError("criar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };

  public readonly delete = async (id: string): Promise<void> => {
    await this.connectDB();

    await prismaClient.militaryRank
      .delete({ where: { id } })
      .catch(async () => {
        throw operationError("deletar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };

  public readonly getByAbbreviatedName = async (
    abbreviatedName: string
  ): Promise<MilitaryRank | null> => {
    await this.connectDB();

    return await prismaClient.militaryRank
      .findUnique({
        where: {
          abbreviatedName,
        },
      })
      .catch(async () => {
        throw operationError("consultar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };

  public readonly getById = async (
    id: string
  ): Promise<MilitaryRank | null> => {
    await this.connectDB();

    return await prismaClient.militaryRank
      .findFirst({ where: { id } })
      .catch(async () => {
        throw operationError("consultar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };

  public readonly update = async (props: UpdateProps): Promise<void> => {
    await this.connectDB();

    await prismaClient.militaryRank
      .update({
        where: { id: props.id },
        data: {
          order: props.order,
          abbreviatedName: props.abbreviatedName,
        },
      })
      .catch(async () => {
        throw operationError("atualizar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };
}
