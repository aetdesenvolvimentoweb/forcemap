import { AppError } from "@domain/erros";

/**
 * Erro para parâmetros obrigatórios ausentes ou vazios
 *
 * @class MissingParamError
 * @extends {AppError}
 * @description
 * Classe de erro especializada para indicar que um parâmetro obrigatório
 * não foi fornecido ou está vazio. Utilizada para validação de entrada
 * de dados e fornece mensagens padronizadas e código de status HTTP
 * apropriado (422 - Unprocessable Entity).
 */
export class MissingParamError extends AppError {
  /**
   * Cria uma nova instância de MissingParamError
   *
   * @constructor
   * @param {string} paramName - Nome do parâmetro que está ausente
   *
   * @description
   * Inicializa um novo erro de parâmetro ausente com mensagem
   * padronizada em português e código de status 422 (Unprocessable Entity).
   * A mensagem segue o padrão "O campo {paramName} precisa ser preenchido."
   * para consistência na interface do usuário.
   *
   * @example
   * ```typescript
   * // Erro para campo de email ausente
   * const error = new MissingParamError("email");
   * // Resultado: "O campo email precisa ser preenchido." (Status: 422)
   *
   * // Erro para campo de senha ausente
   * const error = new MissingParamError("senha");
   * // Resultado: "O campo senha precisa ser preenchido." (Status: 422)
   * ```
   *
   * @throws {TypeError} Se paramName não for uma string
   *
   * @since 1.0.0
   */
  constructor(paramName: string) {
    super(`O campo ${paramName} precisa ser preenchido.`, 422);
    this.name = "MissingParamError";
  }
}
