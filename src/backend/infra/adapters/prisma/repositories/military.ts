import { MilitaryRepository } from "@/backend/data/repositories";
import {
  MilitaryProps,
  MilitaryPublic,
  MilitaryRole,
  UpdateMilitaryProfileProps,
  UpdateMilitaryRoleProps,
} from "@/backend/domain/entities";
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

  public readonly getById = async (
    id: string
  ): Promise<MilitaryPublic | null> => {
    await this.connectDB();

    const military = await prismaClient.military
      .findFirst({
        where: { id },
        select: {
          id: true,
          militaryRankId: true,
          militaryRank: true,
          rg: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .catch(async () => {
        throw operationError("consultar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });

    if (military) {
      return {
        ...military,
        role: military.role as MilitaryRole,
      };
    } else {
      return null;
    }
  };

  public readonly getByRg = async (
    rg: number
  ): Promise<MilitaryPublic | null> => {
    await this.connectDB();
    const military = await prismaClient.military
      .findUnique({
        where: {
          rg,
        },
        select: {
          id: true,
          militaryRankId: true,
          militaryRank: true,
          rg: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .catch(async () => {
        throw operationError("consultar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });

    if (military) {
      return {
        ...military,
        role: military.role as MilitaryRole,
      };
    } else {
      return null;
    }
  };

  public readonly delete = async (id: string): Promise<void> => {
    await this.connectDB();
    await prismaClient.military
      .delete({ where: { id } })
      .catch(async () => {
        throw operationError("deletar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };

  public readonly getAll = async (): Promise<MilitaryPublic[]> => {
    await this.connectDB();

    const military = await prismaClient.military
      .findMany({
        select: {
          id: true,
          militaryRankId: true,
          militaryRank: true,
          rg: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .catch(async () => {
        throw operationError("consultar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });

    let militaryPublic: MilitaryPublic[] = [];
    military.forEach((m) => {
      militaryPublic.push({ ...m, role: m.role as MilitaryRole });
    });

    return militaryPublic;
  };

  public readonly updateProfile = async (
    props: UpdateMilitaryProfileProps
  ): Promise<void> => {
    await this.connectDB();

    await prismaClient.military
      .update({
        where: { id: props.id },
        data: {
          militaryRankId: props.militaryRankId,
          rg: props.rg,
          name: props.name,
        },
      })
      .catch(async () => {
        throw operationError("atualizar");
      })
      .finally(async () => {
        await prismaClient.$disconnect();
      });
  };

  public readonly updateRole = async (
    props: UpdateMilitaryRoleProps
  ): Promise<void> => {
    await this.connectDB();

    await prismaClient.military
      .update({
        where: { id: props.id },
        data: {
          role: props.newRole,
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
