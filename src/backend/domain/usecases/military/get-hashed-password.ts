export interface GetMilitaryHashedPasswordUsecase {
  getHashedPassword: (id: string) => Promise<string | null>;
}
