export interface DeleteMilitaryRankUsecase {
  delete: (id: string) => Promise<void>;
}
