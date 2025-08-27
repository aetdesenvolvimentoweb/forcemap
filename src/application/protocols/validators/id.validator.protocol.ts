export interface IdValidatorProtocol {
  validate(id: string): Promise<void>;
}
