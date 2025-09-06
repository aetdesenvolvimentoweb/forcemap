import { LoggerProtocol } from "../../../application/protocols";
import { UserInputDTO } from "../../../domain/dtos";
import { UpdateUserUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateUserControllerProps {
  updateUserService: UpdateUserUseCase;
  logger: LoggerProtocol;
}

export class UpdateUserController extends BaseController {
  constructor(private readonly props: UpdateUserControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<UserInputDTO>,
  ): Promise<HttpResponse> {
    const { updateUserService } = this.props;

    this.logger.info("Recebida requisição para atualizar militar", {
      params: request.params,
      body: request.body,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateUserService.update(id, body);
        this.logger.info("Usuário atualizado com sucesso", {
          id,
          militaryId: body.militaryId,
          role: body.role,
          password: "senha oculta",
        });
        return noContent();
      },
      "Erro ao atualizar usuário",
      { id, data: body },
    );

    return result as HttpResponse;
  }
}
