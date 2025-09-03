export interface VehicleIdRegisteredValidatorProtocol {
  validate(id: string): Promise<void>;
}
