import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import { AppError } from "@domain/errors";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";

import { EmptyRequestBodyError } from "@presentation/errors";
import type { HttpResponseFactory } from "@presentation/factories";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

interface CreateMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
  createMilitaryRankService: CreateMilitaryRankUseCase;
}

export class CreateMilitaryRankController
  implements Controller<CreateMilitaryRankInputDTO, null>
{
  constructor(private readonly props: CreateMilitaryRankControllerProps) {}

  public handle = async (
    httpRequest: HttpRequest<CreateMilitaryRankInputDTO>,
  ): Promise<HttpResponse<null>> => {
    const { httpResponseFactory, createMilitaryRankService } = this.props;

    try {
      if (!httpRequest.body || !httpRequest.body.data) {
        throw new EmptyRequestBodyError();
      }

      await createMilitaryRankService.create(httpRequest.body.data);

      return httpResponseFactory.created();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return httpResponseFactory.badRequest(error);
      }

      return httpResponseFactory.serverError();
    }
  };
}
