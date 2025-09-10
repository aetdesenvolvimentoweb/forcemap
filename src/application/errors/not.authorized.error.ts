import { AppError } from "../../domain/errors/app.error";

export class NotAuthorizedError extends AppError {
  constructor() {
    super("RG/Senha incorreto(s).", 401);
    this.name = "NotAuthorizedError";
  }
}
