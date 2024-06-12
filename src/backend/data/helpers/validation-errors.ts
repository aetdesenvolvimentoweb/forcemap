import { AppError } from "../errors";

export const missingParamError = (param: string): AppError => {
  return new AppError(`Preencha o campo ${param}.`, 400);
};
