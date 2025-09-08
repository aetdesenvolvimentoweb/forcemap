export interface MilitaryInUseValidatorProtocol {
  validate(militaryId: string): Promise<void>;
}
