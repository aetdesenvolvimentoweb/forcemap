export interface DeleteMilitaryRankUseCase {
  delete(id: string): Promise<void>;
}
