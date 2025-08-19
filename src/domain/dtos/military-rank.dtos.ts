export interface CreateMilitaryRankInputDTO {
  abbreviation: string;
  order: number;
}

export interface UpdateMilitaryRankInputDTO {
  abbreviation?: string;
  order?: number;
}
