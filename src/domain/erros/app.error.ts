/**
 * Classe base para erros customizados da aplicação
 *
 * @class AppError
 * @extends {Error}
 * @description
 * Classe de erro personalizada que estende Error nativo do JavaScript.
 * Fornece funcionalidade adicional como código de status HTTP para
 * facilitar o mapeamento de erros para respostas HTTP apropriadas.
 */
export class AppError extends Error {
  /**
   * Código de status HTTP associado ao erro
   *
   * @readonly
   * @type {number}
   * @memberof AppError
   * @description
   * Código de status HTTP que deve ser retornado quando este erro
   * for mapeado para uma resposta HTTP. Facilita a padronização
   * de respostas de erro na API.
   */
  public readonly statusCode: number;

  /**
   * Cria uma nova instância de AppError
   *
   * @constructor
   * @param {string} message - Mensagem descritiva do erro
   * @param {number} [statusCode=400] - Código de status HTTP (padrão: 400)
   *
   * @description
   * Inicializa um novo erro customizado com mensagem e código de status.
   * O código de status é opcional e assume 400 (Bad Request) como padrão.
   * A propriedade `name` é automaticamente definida como "AppError"
   * para facilitar identificação do tipo de erro.
   *
   * @example
   * ```typescript
   * // Erro com status personalizado
   * const error = new AppError("Usuário não encontrado", 404);
   *
   * // Erro com status padrão (400)
   * const error = new AppError("Dados inválidos");
   * ```
   *
   * @throws {TypeError} Se message não for uma string
   * @throws {TypeError} Se statusCode não for um número
   *
   * @since 1.0.0
   */
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;

    // Garante que a stack trace aponte para o local correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
