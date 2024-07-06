import { GetMilitaryByIdService } from "@/backend/data/services";
import { MilitaryPublic } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class GetMilitaryByIdController implements Controller {
  constructor(private getMilitaryByIdService: GetMilitaryByIdService) {}

  public readonly handle = async (
    request: HttpRequest
  ): Promise<HttpResponse<MilitaryPublic | null>> => {
    try {
      const id = request.params.id as string;
      const military = await this.getMilitaryByIdService.getById(id);
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
