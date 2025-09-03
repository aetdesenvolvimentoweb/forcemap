export interface AuthLogoutUseCase {
  logout(userId: string): Promise<void>;
}
