import { UpdateUserInputDTO } from "src/domain/dtos";

import { LoggerProtocol } from "../../../application/protocols";
import { UpdateUserPasswordUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, noContent } from "../../utils";
import { BaseController } from "../base.controller";

interface UpdateUserPasswordControllerProps {
  updateUserPasswordService: UpdateUserPasswordUseCase;
  logger: LoggerProtocol;
}

export class UpdateUserPasswordController extends BaseController {
  constructor(private readonly props: UpdateUserPasswordControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest<UpdateUserInputDTO>,
  ): Promise<HttpResponse> {
    const { updateUserPasswordService } = this.props;

    this.logger.info("Recebida requisição para atualizar senha do usuário", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "ID");
    if (!id) {
      return emptyRequest();
    }

    const body = this.validateRequiredBody(request);
    if (!body) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        await updateUserPasswordService.updateUserPassword(id, body);
        this.logger.info("Senha do usuário atualizada com sucesso", {
          id,
        });
        return noContent();
      },
      "Erro ao atualizar senha do usuário",
      { id },
    );

    return result as HttpResponse;
  }
}
