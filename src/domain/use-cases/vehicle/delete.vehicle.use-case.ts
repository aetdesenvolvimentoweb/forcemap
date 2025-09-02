export interface DeleteVehicleUseCase {
  delete(id: string): Promise<void>;
}
