import { UpdateMilitaryRoleService } from "@/backend/data/services";
import { UpdateMilitaryRoleProps } from "@/backend/domain/entities";
import { httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class UpdateMilitaryRoleController implements Controller {
  constructor(private updateMilitaryRoleService: UpdateMilitaryRoleService) {}

  public readonly handle = async (
    request: HttpRequest<Omit<UpdateMilitaryRoleProps, "id">>
  ): Promise<HttpResponse> => {
    try {
      const id = request.params.id as string;
      const { newRole } = request.body;

      await this.updateMilitaryRoleService.updateRole({
        id,
        newRole,
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
