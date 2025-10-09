import { AppError } from "../../domain/errors/app.error";

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(`Erro de configuração: ${message}`, 500);
    this.name = "ConfigurationError";
  }
}
