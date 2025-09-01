import { MilitaryRank } from "../../entities";

export type MilitaryOutputDTO = {
  id: string;
  militaryRankId: string;
  militaryRank: MilitaryRank;
  rg: number;
  name: string;
};
