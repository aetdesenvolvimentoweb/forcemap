export interface UserPasswordValidatorProtocol {
  validate(password: string, label?: string): void;
  validateFormat(password: string, label?: string): void;
}
