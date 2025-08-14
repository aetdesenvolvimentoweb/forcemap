import { AppError } from "@domain/errors";
import { EmptyRequestBodyError } from "@presentation/errors";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";
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
      if (!httpRequest.body.data) {
        throw new EmptyRequestBodyError();
      }

      await createMilitaryRankService.create(httpRequest.body.data);

      return httpResponseFactory.created();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof AppError) {
        return httpResponseFactory.badRequest(error);
      }

      return httpResponseFactory.serverError();
    }
  };
}
