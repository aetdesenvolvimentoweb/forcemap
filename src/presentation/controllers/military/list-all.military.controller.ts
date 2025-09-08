import { MilitaryOutputDTO } from "src/domain/dtos";

import { LoggerProtocol } from "../../../application/protocols";
import { ListAllMilitaryUseCase } from "../../../domain/use-cases";
import { HttpResponse } from "../../protocols";
import { ok } from "../../utils";
import { BaseController } from "../base.controller";

interface ListAllMilitaryControllerProps {
  listAllMilitaryService: ListAllMilitaryUseCase;
  logger: LoggerProtocol;
}

export class ListAllMilitaryController extends BaseController {
  constructor(private readonly props: ListAllMilitaryControllerProps) {
    super(props.logger);
  }

  public async handle(): Promise<HttpResponse<MilitaryOutputDTO[]>> {
    const { listAllMilitaryService } = this.props;

    this.logger.info("Recebida requisição para listar todos os militares");

    const result = await this.executeWithErrorHandling(async () => {
      const militarys = await listAllMilitaryService.listAll();
      this.logger.info("Militares listados com sucesso", {
        count: militarys.length,
      });
      return ok<MilitaryOutputDTO[]>(militarys);
    }, "Erro ao listar militares");

    return result as HttpResponse<MilitaryOutputDTO[]>;
  }
}
