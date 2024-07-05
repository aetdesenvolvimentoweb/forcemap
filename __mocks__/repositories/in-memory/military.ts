import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import {
  Military,
  MilitaryProps,
  MilitaryPublic,
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
      ...military,
      militaryRank: militaryRank || undefined,
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
      ...military,
      militaryRank: militaryRank || undefined,
    };
  };
}
