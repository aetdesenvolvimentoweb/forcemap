import { UserRole } from "../../entities";

export type UserInputDTO = {
  militaryId: string;
  role: UserRole;
  password: string;
};
