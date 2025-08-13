import { AppError } from "@domain/errors";

/**
 * Erro para parâmetros com valores inválidos ou fora dos critérios estabelecidos
 *
 * @class InvalidParamError
 * @extends {AppError}
 * @description
 * Classe de erro especializada para indicar que um parâmetro foi fornecido
 * mas não atende aos critérios de validação (formato, tamanho, range, etc.).
 * Utilizada para validação de regras de negócio e fornece mensagens
 * descritivas sobre o motivo da invalidez com código de status HTTP
 * apropriado (422 - Unprocessable Entity).
 */
export class InvalidParamError extends AppError {
  /**
   * Cria uma nova instância de InvalidParamError
   *
   * @constructor
   * @param {string} paramName - Nome do parâmetro que possui valor inválido
   * @param {string} reason - Motivo específico da invalidez do parâmetro
   *
   * @description
   * Inicializa um novo erro de parâmetro inválido com mensagem
   * padronizada em português e código de status 422 (Unprocessable Entity).
   * A mensagem segue o padrão "O campo {paramName} é inválido: {reason}"
   * para fornecer feedback específico sobre o problema encontrado.
   *
   * @example
   * ```typescript
   * // Erro para email com formato inválido
   * const error = new InvalidParamError("email", "deve ter um formato válido");
   * // Resultado: "O campo email é inválido: deve ter um formato válido" (Status: 422)
   *
   * // Erro para idade fora do range permitido
   * const error = new InvalidParamError("idade", "deve estar entre 18 e 65 anos");
   * // Resultado: "O campo idade é inválido: deve estar entre 18 e 65 anos" (Status: 422)
   *
   * // Erro para senha muito curta
   * const error = new InvalidParamError("senha", "deve ter pelo menos 8 caracteres");
   * // Resultado: "O campo senha é inválido: deve ter pelo menos 8 caracteres" (Status: 422)
   * ```
   *
   * @throws {TypeError} Se paramName ou reason não forem strings
   *
   * @since 1.0.0
   */
  constructor(paramName: string, reason: string) {
    super(`O campo ${paramName} é inválido: ${reason}`, 422);
    this.name = "InvalidParamError";
  }
}
