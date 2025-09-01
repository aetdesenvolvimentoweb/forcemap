export interface MilitaryRankIdRegisteredValidatorProtocol {
  validate(id: string): Promise<void>;
}
