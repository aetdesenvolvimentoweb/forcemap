import { AppError } from "../../domain/errors/app.error";

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(message, 429);
    this.name = "TooManyRequestsError";
  }
}
