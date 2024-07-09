import { UpdateMilitaryPasswordService } from "@/backend/data/services";
import { UpdateMilitaryPasswordProps } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class UpdateMilitaryPasswordController implements Controller {
  constructor(
    private updateMilitaryPasswordService: UpdateMilitaryPasswordService
  ) {}

  public readonly handle = async (
    request: HttpRequest<Omit<UpdateMilitaryPasswordProps, "id">>
  ): Promise<HttpResponse> => {
    try {
      const id = request.params.id as string;
      const { currentPassword, newPassword } = request.body;

      await this.updateMilitaryPasswordService.updatePassword({
        id,
        currentPassword,
        newPassword,
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
