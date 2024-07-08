import { UpdateMilitaryProfileService } from "@/backend/data/services";
import { UpdateMilitaryProfileProps } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class UpdateMilitaryProfileController implements Controller {
  constructor(
    private updateMilitaryProfileService: UpdateMilitaryProfileService
  ) {}

  public readonly handle = async (
    request: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">>
  ): Promise<HttpResponse> => {
    try {
      const id = request.params.id as string;
      const { militaryRankId, rg, name } = request.body;

      await this.updateMilitaryProfileService.updateProfile({
        id,
        militaryRankId,
        rg,
        name,
      });

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
