export interface UserUniquenessValidatorProtocol {
  validate(militaryId: string, idToIgnore?: string): Promise<void>;
}
