import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryProps, MilitaryPublic } from "@/backend/domain/entities";
import { created, httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class AddMilitaryController implements Controller {
  constructor(private addMilitaryService: AddMilitaryService) {}

  public readonly handle = async (
    request: HttpRequest<MilitaryProps>
  ): Promise<HttpResponse<MilitaryPublic>> => {
    try {
      await this.addMilitaryService.add(request.body);
      return created();
    } catch (error: any) {
      return httpError(error);
    }
  };
}
