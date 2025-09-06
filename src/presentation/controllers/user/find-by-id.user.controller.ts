import { LoggerProtocol } from "../../../application/protocols";
import { UserOutputDTO } from "../../../domain/dtos";
import { FindByIdUserUseCase } from "../../../domain/use-cases";
import { HttpRequest, HttpResponse } from "../../protocols";
import { emptyRequest, ok } from "../../utils";
import { BaseController } from "../base.controller";

interface FindByIdUserControllerProps {
  findByIdUserService: FindByIdUserUseCase;
  logger: LoggerProtocol;
}

export class FindByIdUserController extends BaseController {
  constructor(private readonly props: FindByIdUserControllerProps) {
    super(props.logger);
  }

  public async handle(
    request: HttpRequest,
  ): Promise<HttpResponse | HttpResponse<UserOutputDTO | null>> {
    const { findByIdUserService } = this.props;

    this.logger.info("Recebida requisição para listar usuário por ID", {
      params: request.params,
    });

    const id = this.validateRequiredParam(request, "id");
    if (!id) {
      return emptyRequest();
    }

    const result = await this.executeWithErrorHandling(
      async () => {
        const user = await findByIdUserService.findById(id);
        this.logger.info("Usuário encontrado com sucesso", {
          id,
          found: !!user,
        });
        return ok<UserOutputDTO | null>(user);
      },
      "Erro ao listar usuário",
      { id },
    );

    return result as HttpResponse;
  }
}
