import { UserRole } from "../../entities";

export type UserAuthenticatedDTO = {
  id: string;
  role: UserRole;
  military: string;
};
