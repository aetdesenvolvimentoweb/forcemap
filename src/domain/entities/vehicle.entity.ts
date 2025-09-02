export enum VehicleSituation {
  BAIXADA = "baixada",
  ATIVA = "ativa",
}

export type Vehicle = {
  id: string;
  name: string;
  situation: VehicleSituation;
  complement?: string;
};
