import { GetAllMilitaryRanksService } from "@/backend/data/services/military-rank/get-all";
import { MilitaryRank } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class GetAllMilitaryRanksController implements Controller {
  constructor(private getAllMilitaryRanksService: GetAllMilitaryRanksService) {}

  public readonly handle = async (
    _request: HttpRequest
  ): Promise<HttpResponse<MilitaryRank[]>> => {
    try {
      const militaryRanks = await this.getAllMilitaryRanksService.getAll();
      return {
        body: {
          success: true,
          data: militaryRanks,
        },
        statusCode: 200,
      };
    } catch (error: any) {
      return httpError(error);
    }
  };
}
