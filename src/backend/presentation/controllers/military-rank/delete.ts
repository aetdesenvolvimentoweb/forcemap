import { DeleteMilitaryRankService } from "@/backend/data/services/military-rank/delete";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class DeleteMilitaryRankController implements Controller {
  constructor(private deleteMilitaryRankService: DeleteMilitaryRankService) {}

  public readonly handle = async (
    request: HttpRequest
  ): Promise<HttpResponse> => {
    try {
      const id = request.params.id as string;

      await this.deleteMilitaryRankService.delete(id);

      return {
        body: {
          success: true,
        },
        statusCode: 200,
      };
    } catch (error: any) {
      return httpError(error);
    }
  };
}
