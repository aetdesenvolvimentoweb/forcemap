import { AppError } from "@domain/errors";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

export class CreateMilitaryRankController
  implements Controller<CreateMilitaryRankInputDTO, null>
{
  public handle = async (
    httpRequest: HttpRequest<CreateMilitaryRankInputDTO>,
  ): Promise<HttpResponse<null>> => {
    try {
      if (!httpRequest.body.data) {
        throw new AppError("Campos obrigatórios não foram preenchidos.", 422);
      }

      return {
        statusCode: 201,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_error: any) {
      return {
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      };
    }
  };
}
