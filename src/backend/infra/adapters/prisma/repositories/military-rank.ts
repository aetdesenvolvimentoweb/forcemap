import { MilitaryRankRepository } from "@/backend/data/repositories";
import { MilitaryRank, MilitaryRankProps } from "@/backend/domain/entities";
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
}
