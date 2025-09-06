import { LoggerProtocol } from "../../../application/protocols";
import { UserOutputDTO } from "../../../domain/dtos";
import { ListAllUserUseCase } from "../../../domain/use-cases";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

interface ListAllUserControllerProps {
  listAllUserService: ListAllUserUseCase;
  logger: LoggerProtocol;
}

export class ListAllUserController extends BaseController {
  constructor(private readonly props: ListAllUserControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse> {
    const { listAllUserService } = this.props;

    this.logger.info("Recebida requisição para listar todos os militares");

    const result = await this.executeWithErrorHandling(async () => {
      const users = await listAllUserService.listAll();
      this.logger.info("Usuários listados com sucesso", {
        count: users.length,
      });
      return ok<UserOutputDTO[]>(users);
    }, "Erro ao listar usuários");

    return result as HttpResponse;
  }
}
