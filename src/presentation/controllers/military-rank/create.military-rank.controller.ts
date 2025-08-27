import { LoggerProtocol } from "src/application/protocols";
import { MilitaryRankInputDTO } from "src/domain/dtos";
import { CreateMilitaryRankUseCase } from "src/domain/use-cases";
import {
  ControllerProtocol,
  HttpRequest,
  HttpResponse,
} from "src/presentation/protocols";
import { created, emptyRequest, handleError } from "src/presentation/utils";

interface CreateMilitaryRankControllerProps {
  createMilitaryRankService: CreateMilitaryRankUseCase;
  logger: LoggerProtocol;
}

export class CreateMilitaryRankController
  implements ControllerProtocol<MilitaryRankInputDTO>
{
  constructor(private readonly props: CreateMilitaryRankControllerProps) {}

  public async handle(
    request: HttpRequest<MilitaryRankInputDTO>,
  ): Promise<HttpResponse> {
    const { createMilitaryRankService, logger } = this.props;

    try {
      logger.info("Recebida requisição para criar posto/graduação", {
        body: request.body,
      });

      if (!request.body || !request.body.data) {
        logger.error("Body da requisição vazio, inválido ou sem DTO válido");
        return emptyRequest();
      }

      await createMilitaryRankService.create(request.body.data);

      logger.info("Posto/graduação criado com sucesso");
      return created();
    } catch (error: unknown) {
      logger.error("Erro ao criar posto/graduação", { error });
      return handleError(error);
    }
  }
}
