import { UserRole } from "../../entities";

export type UserLoggedDTO = {
  id: string;
  role: UserRole;
  military: string;
};
