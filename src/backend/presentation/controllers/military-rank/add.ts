import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRank, MilitaryRankProps } from "@/backend/domain/entities";
import { created, httpError } from "../../helpers";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class AddMilitaryRankController implements Controller {
  constructor(private addMilitaryRankService: AddMilitaryRankService) {}

  public readonly handle = async (
    request: HttpRequest<MilitaryRankProps>
  ): Promise<HttpResponse<MilitaryRank>> => {
    try {
      await this.addMilitaryRankService.add(request.body);
      return created();
    } catch (error: any) {
      return httpError(error);
    }
  };
}
