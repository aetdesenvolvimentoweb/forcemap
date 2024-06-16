import { AppError } from "@/backend/data/errors";

export const connectionError = (): AppError => {
  return new AppError(
    "Erro na conexão com o banco de dados. Verifique sua conexão com a internet.",
    500
  );
};
