import { UserReadRepository, UserWriteRepository } from "./user";

export interface UserRepository
  extends UserReadRepository,
    UserWriteRepository {}
