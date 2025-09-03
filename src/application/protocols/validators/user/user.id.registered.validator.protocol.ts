export interface UserIdRegisteredValidatorProtocol {
  validate(id: string): Promise<void>;
}
