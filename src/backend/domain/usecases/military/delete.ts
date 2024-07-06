export interface DeleteMilitaryUsecase {
  delete: (id: string) => Promise<void>;
}
