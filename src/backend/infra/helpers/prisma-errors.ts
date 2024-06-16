import { AppError } from "@/backend/data/errors";

export const connectionError = (): AppError => {
  return new AppError(
    "Erro na conexão com o banco de dados. Verifique sua conexão com a internet.",
    500
  );
};

export const operationError = (operation: string): AppError => {
  return new AppError(
    `Erro ao ${operation} registro(s) no banco de dados.`,
    500
  );
};
