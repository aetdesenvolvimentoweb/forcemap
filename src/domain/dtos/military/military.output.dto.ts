import { MilitaryRank } from "../../entities";

export type MilitaryOutputDTO = {
  id: string;
  militaryRank: MilitaryRank;
  rg: number;
  name: string;
};
