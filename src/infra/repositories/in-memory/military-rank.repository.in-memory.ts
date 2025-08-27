import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";

export class MilitaryRankRepositoryInMemory implements MilitaryRankRepository {
  private items: MilitaryRank[] = [];

  public create = async (data: MilitaryRankInputDTO): Promise<void> => {
    const entity: MilitaryRank = {
      ...data,
      id: `${Date.now()}-${Math.random()}`,
    };
    this.items.push(entity);
  };

  public findByAbbreviation = async (
    abbreviation: string,
  ): Promise<MilitaryRank | null> => {
    return (
      this.items.find((item) => item.abbreviation === abbreviation) || null
    );
  };

  public findByOrder = async (order: number): Promise<MilitaryRank | null> => {
    return this.items.find((item) => item.order === order) || null;
  };

  public listAll = async (): Promise<MilitaryRank[]> => {
    return this.items;
  };
}
