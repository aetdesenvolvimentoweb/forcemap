export type MilitaryRankProps = {
  order: number;
  abbreviatedName: string;
};

export type UpdateMilitaryRankProps = MilitaryRankProps & {
  id: string;
};

export type MilitaryRank = MilitaryRankProps & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
