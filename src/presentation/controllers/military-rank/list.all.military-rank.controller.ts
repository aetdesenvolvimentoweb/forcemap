import { MilitaryRank } from "@domain/entities";
import { AppError } from "@domain/errors";
import { ListAllMilitaryRankUseCase } from "@domain/usecases";

import type { HttpResponseFactory } from "@presentation/factories";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

interface ListAllMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
  listAllMilitaryRankService: ListAllMilitaryRankUseCase;
}

export class ListAllMilitaryRankController
  implements Controller<null, MilitaryRank[]>
{
  constructor(private readonly props: ListAllMilitaryRankControllerProps) {}

  public handle = async (
    _httpRequest: HttpRequest<null>,
  ): Promise<HttpResponse<MilitaryRank[]>> => {
    const { httpResponseFactory, listAllMilitaryRankService } = this.props;

    try {
      const militaryRanks = await listAllMilitaryRankService.listAll();
      return httpResponseFactory.ok(militaryRanks);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return httpResponseFactory.badRequest<MilitaryRank[]>(error);
      }

      return httpResponseFactory.serverError<MilitaryRank[]>();
    }
  };
}
