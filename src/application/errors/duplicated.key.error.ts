import { AppError } from "@domain/errors";

/**
 * Erro para violações de unicidade de chaves ou entidades duplicadas
 *
 * @class DuplicatedKeyError
 * @extends {AppError}
 * @description
 * Classe de erro especializada para indicar que uma entidade ou valor
 * que deve ser único já existe no sistema. Utilizada para validação
 * de constraints de unicidade e fornece mensagens padronizadas com
 * código de status HTTP apropriado (409 - Conflict) para indicar
 * conflito com estado existente dos dados.
 */
export class DuplicatedKeyError extends AppError {
  /**
   * Cria uma nova instância de DuplicatedKeyError
   *
   * @constructor
   * @param {string} entity - Nome ou descrição da entidade/valor que está duplicado
   *
   * @description
   * Inicializa um novo erro de chave duplicada com mensagem
   * padronizada em português e código de status 409 (Conflict).
   * A mensagem segue o padrão "{entity} já está em uso."
   * para indicar claramente que o valor fornecido viola uma
   * constraint de unicidade.
   *
   * @example
   * ```typescript
   * // Erro para email já cadastrado
   * const error = new DuplicatedKeyError("Email");
   * // Resultado: "Email já está em uso." (Status: 409)
   *
   * // Erro para abreviatura de posto militar duplicada
   * const error = new DuplicatedKeyError("Abreviatura 'TEN'");
   * // Resultado: "Abreviatura 'TEN' já está em uso." (Status: 409)
   *
   * // Erro para ordem de precedência duplicada
   * const error = new DuplicatedKeyError("Ordem de precedência 5");
   * // Resultado: "Ordem de precedência 5 já está em uso." (Status: 409)
   * ```
   *
   * @throws {TypeError} Se entity não for uma string
   *
   * @since 1.0.0
   */
  constructor(entity: string) {
    super(`${entity} já está em uso.`, 409);
    this.name = "DuplicatedKeyError";
  }
}
