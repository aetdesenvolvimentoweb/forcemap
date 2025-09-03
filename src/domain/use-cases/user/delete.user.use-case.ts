export interface DeleteUserUseCase {
  delete(id: string): Promise<void>;
}
