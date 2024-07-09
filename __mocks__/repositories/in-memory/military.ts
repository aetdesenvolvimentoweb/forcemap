import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import {
  Military,
  MilitaryProps,
  MilitaryPublic,
  UpdateMilitaryPasswordProps,
  UpdateMilitaryProfileProps,
  UpdateMilitaryRoleProps,
} from "@/backend/domain/entities";
import { ObjectId } from "mongodb";

export class MilitaryInMemoryRepository implements MilitaryRepository {
  private military: Military[];
  constructor(private militaryRankRepository: MilitaryRankRepository) {
    this.military = [];
  }

  public readonly add = async (props: MilitaryProps): Promise<void> => {
    const date = new Date();
    const militaryRank = (await this.militaryRankRepository.getById(
      props.militaryRankId
    )) || {
      id: props.militaryRankId,
      order: 1,
      abbreviatedName: "Cel",
      createdAt: date,
      updatedAt: date,
    };

    this.military.push({
      id: new ObjectId().toString(),
      ...props,
      militaryRank,
      createdAt: date,
      updatedAt: date,
    });
  };

  public readonly getById = async (
    id: string
  ): Promise<MilitaryPublic | null> => {
    const military = this.military.find((m) => m.id === id);

    if (!military) return null;

    const militaryRankId = military.militaryRankId;
    const militaryRank =
      await this.militaryRankRepository.getById(militaryRankId);

    return {
      id: military.id,
      militaryRankId: military.militaryRankId,
      militaryRank: militaryRank || undefined,
      rg: military.rg,
      name: military.name,
      role: military.role,
      createdAt: military.createdAt,
      updatedAt: military.updatedAt,
    };
  };

  public readonly getByRg = async (
    rg: number
  ): Promise<MilitaryPublic | null> => {
    const military = this.military.find((m) => m.rg === rg);

    if (!military) return null;

    const militaryRankId = military?.militaryRankId || "";
    const militaryRank =
      await this.militaryRankRepository.getById(militaryRankId);

    return {
      id: military.id,
      militaryRankId: military.militaryRankId,
      militaryRank: militaryRank || undefined,
      rg: military.rg,
      name: military.name,
      role: military.role,
      createdAt: military.createdAt,
      updatedAt: military.updatedAt,
    };
  };

  public readonly delete = async (id: string): Promise<void> => {
    this.military = this.military.filter((m) => m.id !== id);
  };

  public readonly getAll = async (): Promise<MilitaryPublic[]> => {
    let militaryPublic: MilitaryPublic[] = [];

    this.military.forEach(async (military) => {
      const militaryRank = await this.militaryRankRepository.getById(
        military.militaryRankId
      );

      militaryPublic.push({
        id: military.id,
        militaryRankId: military.militaryRankId,
        militaryRank: militaryRank || undefined,
        rg: military.rg,
        name: military.name,
        role: military.role,
        createdAt: military.createdAt,
        updatedAt: military.updatedAt,
      });
    });
    return militaryPublic;
  };

  public readonly updateProfile = async (
    props: UpdateMilitaryProfileProps
  ): Promise<void> => {
    const index = this.military.findIndex(
      (military) => military.id === props.id
    );
    this.military[index] = {
      ...this.military[index],
      militaryRankId: props.militaryRankId,
      rg: props.rg,
      name: props.name,
      updatedAt: new Date(),
    };
  };

  public readonly updateRole = async (
    props: UpdateMilitaryRoleProps
  ): Promise<void> => {
    const index = this.military.findIndex(
      (military) => military.id === props.id
    );
    this.military[index] = {
      ...this.military[index],
      role: props.newRole,
      updatedAt: new Date(),
    };
  };

  public readonly updatePassword = async (
    props: UpdateMilitaryPasswordProps
  ): Promise<void> => {
    const index = this.military.findIndex(
      (military) => military.id === props.id
    );
    this.military[index] = {
      ...this.military[index],
      password: props.newPassword,
      updatedAt: new Date(),
    };
  };
}
