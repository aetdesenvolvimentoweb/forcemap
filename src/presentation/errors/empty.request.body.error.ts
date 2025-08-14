import { AppError } from "@domain/errors";

/**
 * Erro para requisições HTTP com corpo vazio ou campos obrigatórios ausentes
 *
 * @class EmptyRequestBodyError
 * @extends {AppError}
 * @description
 * Erro específico da camada de presentation que indica que uma requisição HTTP
 * foi recebida sem os dados obrigatórios no corpo da requisição. Este erro é
 * tipicamente usado em controllers para validar se o request body contém as
 * informações necessárias antes de processar a operação.
 *
 * @see {@link AppError} - Classe base para erros customizados
 * @see {@link HttpClientError} - Helper para converter erro em resposta HTTP
 */
export class EmptyRequestBodyError extends AppError {
  /**
   * Cria uma nova instância de EmptyRequestBodyError
   *
   * @constructor
   * @description
   * Inicializa o erro com uma mensagem padrão em português e status HTTP 422
   * (Unprocessable Entity). O status 422 é apropriado pois indica que o servidor
   * entendeu a requisição, mas não conseguiu processá-la devido a dados inválidos
   * ou ausentes.
   */
  constructor() {
    super("Campos obrigatórios não foram preenchidos.", 422);
    this.name = "EmptyRequestBodyError";
  }
}
