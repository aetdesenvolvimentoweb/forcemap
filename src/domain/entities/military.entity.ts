import { MilitaryRank } from "./military-rank.entity";

export type Military = {
  id: string;
  militaryRankId: string;
  militaryRank?: MilitaryRank;
  rg: number;
  name: string;
};
