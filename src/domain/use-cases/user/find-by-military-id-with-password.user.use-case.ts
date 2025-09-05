import { User } from "../../entities";

export interface FindByMilitaryIdWithPasswordUserUseCase {
  findByMilitaryIdWithPassword(militaryId: string): Promise<User | null>;
}
