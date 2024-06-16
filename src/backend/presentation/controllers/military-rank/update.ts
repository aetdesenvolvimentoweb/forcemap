import { UpdateMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankProps } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class UpdateMilitaryRankController implements Controller {
  constructor(private updateMilitaryRankService: UpdateMilitaryRankService) {}

  public readonly handle = async (
    request: HttpRequest<MilitaryRankProps>
  ): Promise<HttpResponse> => {
    try {
      const id = request.params.id as string;
      const { order, abbreviatedName } = request.body;

      await this.updateMilitaryRankService.update({
        id,
        order,
        abbreviatedName,
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
