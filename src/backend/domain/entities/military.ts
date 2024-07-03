import { MilitaryRank } from "./military-rank";

export type MilitaryRole = "Usuário" | "ACA" | "Administrador";

export type MilitaryProps = {
  militaryRankId: string;
  rg: number;
  name: string;
  role: MilitaryRole;
  password: string;
};

export type Military = MilitaryProps & {
  id: string;
  militaryRank?: MilitaryRank;
  createdAt: Date;
  updatedAt: Date;
};

export type MilitaryPublic = Omit<Military, "password">;

export type UpdateMilitaryPasswordProps = {
  id: string;
  currentPassword: string;
  newPassword: string;
};

export type UpdateMilitaryProfileProps = {
  id: string;
  militaryRankId: string;
  rg: number;
  name: string;
};

export type UpdateMilitaryRoleProps = {
  id: string;
  newRole: MilitaryRole;
};
