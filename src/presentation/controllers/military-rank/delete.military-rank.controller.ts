import { MissingParamError } from "@application/errors";

import { AppError } from "@domain/errors";
import type { DeleteMilitaryRankUseCase } from "@domain/usecases";

import type { HttpResponseFactory } from "@presentation/factories";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

interface DeleteMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
  deleteMilitaryRankService: DeleteMilitaryRankUseCase;
}

export class DeleteMilitaryRankController implements Controller<string, null> {
  constructor(private readonly props: DeleteMilitaryRankControllerProps) {}

  public handle = async (
    httpRequest: HttpRequest<string>,
  ): Promise<HttpResponse<null>> => {
    const { httpResponseFactory, deleteMilitaryRankService } = this.props;

    try {
      if (!httpRequest.params || !httpRequest.params.id) {
        throw new MissingParamError("ID");
      }

      await deleteMilitaryRankService.delete(httpRequest.params.id);

      return httpResponseFactory.ok();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return httpResponseFactory.badRequest(error);
      }

      return httpResponseFactory.serverError();
    }
  };
}
