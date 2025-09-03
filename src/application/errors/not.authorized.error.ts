import { AppError } from "../../domain/errors";

export class NotAuthorizedError extends AppError {
  constructor() {
    super("RG/Senha incorreto(s).", 401);
    this.name = "NotAuthorizedError";
  }
}
