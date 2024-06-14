import { AppError } from "../errors";

export const missingParamError = (param: string): AppError => {
  return new AppError(`Preencha o campo ${param}.`, 400);
};

export const duplicatedKeyError = (key: string): AppError => {
  return new AppError(
    `Já existe um registro para o campo ${key} com esse valor`,
    400
  );
};
