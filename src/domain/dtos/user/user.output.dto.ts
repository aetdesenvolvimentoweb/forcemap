import { UserRole } from "../../entities";
import { MilitaryOutputDTO } from "../military";

export type UserOutputDTO = {
  id: string;
  role: UserRole;
  military: MilitaryOutputDTO;
};
