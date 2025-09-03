export enum UserRole {
  ADMIN = "admin",
  CHEFE = "chefe",
  BOMBEIRO = "bombeiro",
}

export type User = {
  id: string;
  militaryId: string;
  role: UserRole;
  password: string;
};
