import { DeleteMilitaryService } from "@/backend/data/services";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class DeleteMilitaryController implements Controller {
  constructor(private deleteMilitaryService: DeleteMilitaryService) {}

  public readonly handle = async (
    request: HttpRequest
  ): Promise<HttpResponse> => {
    try {
      const id = request.params.id as string;
      await this.deleteMilitaryService.delete(id);
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
