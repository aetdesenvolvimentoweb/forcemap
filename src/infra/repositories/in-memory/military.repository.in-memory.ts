import { EntityNotFoundError } from "../../../application/errors";
import { MilitaryInputDTO, MilitaryOutputDTO } from "../../../domain/dtos";
import { Military } from "../../../domain/entities";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "../../../domain/repositories";

export class MilitaryRepositoryInMemory implements MilitaryRepository {
  private items: Military[] = [];

  constructor(
    private readonly militaryRankRepository: MilitaryRankRepository,
  ) {}

  private mapperMilitary = async (
    military: Military,
  ): Promise<MilitaryOutputDTO> => {
    const militaryRank = await this.militaryRankRepository.findById(
      military.militaryRankId,
    );

    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }

    return {
      id: military.id,
      militaryRank,
      rg: military.rg,
      name: military.name,
    };
  };

  public create = async (data: MilitaryInputDTO): Promise<void> => {
    const entity: Military = {
      ...data,
      id: crypto.randomUUID(),
    };
    this.items.push(entity);
  };

  public delete = async (id: string): Promise<void> => {
    this.items = this.items.filter((item) => item.id !== id);
  };

  public findByRg = async (rg: number): Promise<MilitaryOutputDTO | null> => {
    const military = this.items.find((item) => item.rg === rg);

    if (!military) {
      return null;
    }

    const militaryMapped = await this.mapperMilitary(military);
    return militaryMapped;
  };

  public findById = async (id: string): Promise<MilitaryOutputDTO | null> => {
    const military = this.items.find((item) => item.id === id);
    if (!military) {
      return null;
    }

    const militaryMapped = await this.mapperMilitary(military);
    return militaryMapped;
  };

  public listAll = async (): Promise<MilitaryOutputDTO[]> => {
    const militariesMapped = await Promise.all(
      this.items.map((military) => this.mapperMilitary(military)),
    );
    return militariesMapped.filter((military) => military.rg !== 9999);
  };

  public update = async (id: string, data: MilitaryInputDTO): Promise<void> => {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  };
}
