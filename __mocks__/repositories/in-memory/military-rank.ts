import { MilitaryRankRepository } from "@/backend/data/repositories";
import {
  MilitaryRank,
  MilitaryRankProps,
  UpdateProps,
} from "@/backend/domain/entities";

export class MilitaryRankInMemoryRepository implements MilitaryRankRepository {
  militaryRanks: MilitaryRank[] = [];

  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    const date = new Date();

    this.militaryRanks.push({
      id: crypto.randomUUID(),
      ...props,
      createdAt: date,
      updatedAt: date,
    });
  };

  public readonly delete = async (id: string): Promise<void> => {
    this.militaryRanks = this.militaryRanks.filter(
      (militaryRank) => militaryRank.id !== id
    );
  };

  public readonly getAll = async (): Promise<MilitaryRank[]> => {
    return this.militaryRanks;
  };

  public readonly getByAbbreviatedName = async (
    abbreviatedName: string
  ): Promise<MilitaryRank | null> => {
    return (
      this.militaryRanks.find(
        (militaryRank) => militaryRank.abbreviatedName === abbreviatedName
      ) || null
    );
  };

  public readonly getById = async (
    id: string
  ): Promise<MilitaryRank | null> => {
    return (
      this.militaryRanks.find((militaryRank) => militaryRank.id === id) || null
    );
  };

  public readonly update = async (props: UpdateProps): Promise<void> => {
    const index = this.militaryRanks.findIndex(
      (militaryRank) => militaryRank.id === props.id
    );

    this.militaryRanks[index] = {
      ...this.militaryRanks[index],
      ...props,
      updatedAt: new Date(),
    };
  };
}
