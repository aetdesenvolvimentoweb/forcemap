import { EntityNotFoundError } from "../../../application/errors";
import { SYSTEM_USER_RG } from "../../../domain/constants";
import {
  UpdateUserInputDTO,
  UserInputDTO,
  UserOutputDTO,
} from "../../../domain/dtos";
import { User, UserRole } from "../../../domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";

export class UserRepositoryInMemory implements UserRepository {
  private items: User[] = [];

  constructor(private readonly militaryRepository: MilitaryRepository) {}

  private mapperUser = async (user: User): Promise<UserOutputDTO> => {
    const military = await this.militaryRepository.findById(user.militaryId);

    if (!military) {
      throw new EntityNotFoundError("Militar");
    }

    return {
      id: user.id,
      military,
      role: user.role,
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

  public findByIdWithPassword = async (id: string): Promise<User | null> => {
    const user = this.items.find((item) => item.id === id);

    if (!user) {
      return null;
    }

    return user;
  };

  /**
   * Lista todos os usuários, exceto o usuário de sistema
   * O usuário com RG {@link SYSTEM_USER_RG} é filtrado por questões de segurança
   */
  public listAll = async (): Promise<UserOutputDTO[]> => {
    const usersMapped = await Promise.all(
      this.items.map((user) => this.mapperUser(user)),
    );
    return usersMapped.filter((user) => user.military.rg !== SYSTEM_USER_RG);
  };

  public updateUserPassword = async (
    id: string,
    data: UpdateUserInputDTO,
  ): Promise<void> => {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index].password = data.newPassword;
    }
  };

  public updateUserRole = async (id: string, role: UserRole): Promise<void> => {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index].role = role;
    }
  };
}
