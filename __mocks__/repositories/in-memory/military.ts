import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { Military, MilitaryProps } from "@/backend/domain/entities";
import { ObjectId } from "mongodb";

export class MilitaryInMemoryRepository implements MilitaryRepository {
  private military: Military[];
  constructor(private militaryRankRepository: MilitaryRankRepository) {
    this.military = [];
  }

  public readonly add = async (props: MilitaryProps): Promise<void> => {
    const militaryRank = (await this.militaryRankRepository.getById(
      props.militaryRankId
    )) || {
      id: props.militaryRankId,
      order: 1,
      abbreviatedName: "Cel",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.military.push({
      id: new ObjectId().toString(),
      ...props,
      militaryRank,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };
}
