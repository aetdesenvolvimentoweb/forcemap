export interface MilitaryRankInUseValidatorProtocol {
  validate(militaryRankId: string): Promise<void>;
}
