import { MilitaryRankRepository } from "@/backend/data/repositories";
import { MilitaryRank, MilitaryRankProps } from "@/backend/domain/entities";

export class MilitaryRankInMemoryRepository implements MilitaryRankRepository {
  militaryRanks: any[] = [];

  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    this.militaryRanks.push({ id: crypto.randomUUID(), ...props });
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
}
