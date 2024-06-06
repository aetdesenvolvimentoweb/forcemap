import { MilitaryRankRepository } from "@/backend/data";
import { MilitaryRankProps } from "@/backend/domain";

export class MilitaryRankInMemoryRepository implements MilitaryRankRepository {
  militaryRanks: any[] = [];

  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    this.militaryRanks.push({ id: crypto.randomUUID(), ...props });
  };
}
