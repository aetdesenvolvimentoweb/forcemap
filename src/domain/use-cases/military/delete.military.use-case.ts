export interface DeleteMilitaryUseCase {
  delete(id: string): Promise<void>;
}
