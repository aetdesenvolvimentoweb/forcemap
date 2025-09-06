import { LoggerProtocol } from "../../../application/protocols";
import { UserInputDTO } from "../../../domain/dtos";
import { CreateUserUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { created, emptyRequest } from "../../utils";
import { BaseController } from "../base.controller";

interface CreateUserControllerProps {
  createUserService: CreateUserUseCase;
  logger: LoggerProtocol;
}

export class CreateUserController extends BaseController {
  constructor(private readonly props: CreateUserControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<UserInputDTO>,
  ): Promise<HttpResponse> {
    const { createUserService } = this.props;

    this.logger.info("Recebida requisição para criar militar", {
      body: request.body,
    });

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await createUserService.create(body);
        this.logger.info("Militar criado com sucesso", {
          militaryId: body.militaryId,
          role: body.role,
          password: "senha oculta",
        });
        return created();
      },
      "Erro ao criar militar",
      body,
    );

    return result as HttpResponse;
  }
}
