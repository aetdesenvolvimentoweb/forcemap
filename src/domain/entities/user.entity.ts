export enum UserRole {
  ADMIN = "Admin",
  CHEFE = "Chefe",
  ACA = "ACA",
  BOMBEIRO = "Bombeiro",
}

export type User = {
  id: string;
  militaryId: string;
  role: UserRole;
  password: string;
};
