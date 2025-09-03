import { UserRole } from "../../entities";

export type UserLoggedDTO = {
  id: string;
  role: UserRole;
  militaryRank: string;
  military: string;
  token: string;
};
