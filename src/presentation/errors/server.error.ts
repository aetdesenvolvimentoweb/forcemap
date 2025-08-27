import { AppError } from "src/domain/errors";

export class ServerError extends AppError {
  constructor() {
    super("Erro interno no servidor.", 500);
    this.name = "ServerError";
  }
}
