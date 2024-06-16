import { MilitaryRankRepository } from "@/backend/data/repositories";
import {
  MilitaryRank,
  MilitaryRankProps,
  UpdateProps,
} from "@/backend/domain/entities";
import { prismaClient } from "../../prisma-client";

export class MilitaryRankPrismaRespository implements MilitaryRankRepository {
  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    await prismaClient.militaryRank.create({
      data: {
        order: props.order,
        abbreviatedName: props.abbreviatedName,
      },
    });
  };

  public readonly getByAbbreviatedName = async (
    abbreviatedName: string
  ): Promise<MilitaryRank | null> => {
    return await prismaClient.militaryRank.findUnique({
      where: {
        abbreviatedName,
      },
    });
  };

  public readonly getById = async (
    id: string
  ): Promise<MilitaryRank | null> => {
    return await prismaClient.militaryRank.findFirst({
      where: {
        id,
      },
    });
  };

  public readonly update = async (props: UpdateProps): Promise<void> => {
    await prismaClient.militaryRank.update({
      where: {
        id: props.id,
      },
      data: {
        order: props.order,
        abbreviatedName: props.abbreviatedName,
      },
    });
  };
}
