import { MilitaryRankRepository } from "@/backend/data";
import { MilitaryRankProps } from "@/backend/domain";
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
}
