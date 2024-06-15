import { GetMilitaryRankByIdService } from "@/backend/data/services";
import { MilitaryRank } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class GetMilitaryRankByIdController implements Controller {
  constructor(private getMilitaryRankByIdService: GetMilitaryRankByIdService) {}

  public readonly handle = async (
    request: HttpRequest
  ): Promise<HttpResponse<MilitaryRank | null>> => {
    try {
      const id = request.params.id as string;
      const militaryRank = await this.getMilitaryRankByIdService.getById(id);
      return {
        body: {
          success: true,
          data: militaryRank,
        },
        statusCode: 200,
      };
    } catch (error: any) {
      return httpError(error);
    }
  };
}
