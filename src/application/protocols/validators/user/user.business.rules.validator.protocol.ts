export interface UserBusinessRulesValidatorProtocol {
  validate(militaryId: string): Promise<void>;
}
