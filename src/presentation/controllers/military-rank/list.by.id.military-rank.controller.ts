import { MissingParamError } from "@application/errors";

import { MilitaryRank } from "@domain/entities";
import { AppError } from "@domain/errors";
import type { ListByIdMilitaryRankUseCase } from "@domain/usecases";

import type { HttpResponseFactory } from "@presentation/factories";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

interface ListByIdMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
  listByIdMilitaryRankService: ListByIdMilitaryRankUseCase;
}

export class ListByIdMilitaryRankController
  implements Controller<string, MilitaryRank | null>
{
  constructor(private readonly props: ListByIdMilitaryRankControllerProps) {}

  public handle = async (
    httpRequest: HttpRequest<string>,
  ): Promise<HttpResponse<MilitaryRank | null>> => {
    const { httpResponseFactory, listByIdMilitaryRankService } = this.props;

    try {
      if (!httpRequest.params || !httpRequest.params.id) {
        throw new MissingParamError("ID");
      }

      const httpResponse = await listByIdMilitaryRankService.listById(
        httpRequest.params.id,
      );

      return httpResponseFactory.ok(httpResponse);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return httpResponseFactory.badRequest(error);
      }

      return httpResponseFactory.serverError();
    }
  };
}
