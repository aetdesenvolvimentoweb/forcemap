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

export const invalidParamError = (param: string): AppError => {
  return new AppError(`Valor inválido para o campo: ${param}`, 400);
};

export const unregisteredFieldIdError = (field: string): AppError => {
  return new AppError(`Nenhum registro encontrado para esse ${field}.`, 404);
};
