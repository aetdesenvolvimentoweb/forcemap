import { EntityNotFoundError } from "../../../application/errors";
import { UserInputDTO, UserOutputDTO } from "../../../domain/dtos";
import { User } from "../../../domain/entities";
import {
  MilitaryRankRepository,
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";

export class UserRepositoryInMemory implements UserRepository {
  private items: User[] = [];

  constructor(
    private readonly militaryRankRepository: MilitaryRankRepository,
    private readonly militaryRepository: MilitaryRepository,
  ) {}

  private mapperUser = async (user: User): Promise<UserOutputDTO> => {
    const military = await this.militaryRepository.findById(user.militaryId);

    if (!military) {
      throw new EntityNotFoundError("Militar");
    }

    return {
      ...user,
      military,
    };
  };

  public create = async (data: UserInputDTO): Promise<void> => {
    const entity: User = {
      ...data,
      id: crypto.randomUUID(),
    };
    this.items.push(entity);
  };

  public delete = async (id: string): Promise<void> => {
    this.items = this.items.filter((item) => item.id !== id);
  };

  public findByMilitaryId = async (
    militaryId: string,
  ): Promise<UserOutputDTO | null> => {
    const user = this.items.find((item) => item.militaryId === militaryId);

    if (!user) {
      return null;
    }

    const userMapped = await this.mapperUser(user);
    return userMapped;
  };

  public findByMilitaryIdWithPassword = async (
    militaryId: string,
  ): Promise<User | null> => {
    const user = this.items.find((item) => item.militaryId === militaryId);

    if (!user) {
      return null;
    }

    return user;
  };

  public findById = async (id: string): Promise<UserOutputDTO | null> => {
    const user = this.items.find((item) => item.id === id);
    if (!user) {
      return null;
    }

    const userMapped = await this.mapperUser(user);
    return userMapped;
  };

  public listAll = async (): Promise<UserOutputDTO[]> => {
    const usersMapped = await Promise.all(
      this.items.map((user) => this.mapperUser(user)),
    );
    return usersMapped;
  };

  public update = async (id: string, data: UserInputDTO): Promise<void> => {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  };
}
