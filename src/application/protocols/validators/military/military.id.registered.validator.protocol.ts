export interface MilitaryIdRegisteredValidatorProtocol {
  validate(id: string): Promise<void>;
}
