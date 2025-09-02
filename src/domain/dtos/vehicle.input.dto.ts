import { VehicleSituation } from "../entities/vehicle.entity";

export type VehicleInputDTO = {
  name: string;
  situation: VehicleSituation;
  complement?: string;
};
