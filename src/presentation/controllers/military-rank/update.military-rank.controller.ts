import { MissingParamError } from "@application/errors";

import type { MilitaryRankInputDTO } from "@domain/dtos";
import { AppError } from "@domain/errors";
import type { UpdateMilitaryRankUseCase } from "@domain/usecases";

import { EmptyRequestBodyError } from "@presentation/errors";
import type { HttpResponseFactory } from "@presentation/factories";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

interface UpdateMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
  updateMilitaryRankService: UpdateMilitaryRankUseCase;
}

export class UpdateMilitaryRankController
  implements Controller<MilitaryRankInputDTO, null>
{
  constructor(private readonly props: UpdateMilitaryRankControllerProps) {}

  public handle = async (
    httpRequest: HttpRequest<MilitaryRankInputDTO>,
  ): Promise<HttpResponse<null>> => {
    const { httpResponseFactory, updateMilitaryRankService } = this.props;

    try {
      if (!httpRequest.params || !httpRequest.params.id) {
        throw new MissingParamError("ID");
      }

      if (!httpRequest.body || !httpRequest.body.data) {
        throw new EmptyRequestBodyError();
      }

      await updateMilitaryRankService.update(
        httpRequest.params.id,
        httpRequest.body.data,
      );

      return httpResponseFactory.ok();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return httpResponseFactory.badRequest(error);
      }

      return httpResponseFactory.serverError();
    }
  };
}
