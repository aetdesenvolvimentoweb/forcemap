import { VehicleInputDTO } from "../../../domain/dtos";
import { Vehicle } from "../../../domain/entities";
import { VehicleRepository } from "../../../domain/repositories";

export class VehicleRepositoryInMemory implements VehicleRepository {
  private items: Vehicle[] = [];

  public create = async (data: VehicleInputDTO): Promise<void> => {
    const entity: Vehicle = {
      ...data,
      id: crypto.randomUUID(),
    };
    this.items.push(entity);
  };

  public delete = async (id: string): Promise<void> => {
    this.items = this.items.filter((item) => item.id !== id);
  };

  public findByName = async (name: string): Promise<Vehicle | null> => {
    return this.items.find((item) => item.name === name) || null;
  };

  public findById = async (id: string): Promise<Vehicle | null> => {
    return this.items.find((item) => item.id === id) || null;
  };

  public listAll = async (): Promise<Vehicle[]> => {
    return this.items;
  };

  public update = async (id: string, data: VehicleInputDTO): Promise<void> => {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  };
}
