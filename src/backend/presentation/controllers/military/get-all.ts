import { GetAllMilitaryService } from "@/backend/data/services";
import { MilitaryPublic } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class GetAllMilitaryController implements Controller {
  constructor(private getAllMilitaryService: GetAllMilitaryService) {}

  public readonly handle = async (
    request: HttpRequest
  ): Promise<HttpResponse<MilitaryPublic[]>> => {
    try {
      const military = await this.getAllMilitaryService.getAll();
      return {
        body: {
          success: true,
          data: military,
        },
        statusCode: 200,
      };
    } catch (error: any) {
      return httpError(error);
    }
  };
}
