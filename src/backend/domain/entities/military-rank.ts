export type MilitaryRankProps = {
  order: number;
  abbreviatedName: string;
};

export type MilitaryRank = MilitaryRankProps & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateProps = {
  id: string;
  order: number;
  abbreviatedName: string;
};
