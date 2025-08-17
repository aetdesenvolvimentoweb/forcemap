import type { IdSanitizerProtocol } from "@application/protocols";
import { IdSanitizer } from "@application/sanitizers/id.sanitizer";

/**
 * 🏭 MAIN LAYER - Factory para Sanitizer
 *
 * Responsabilidade:
 * - Criar instância do sanitizer
 * - Configurar dependências se necessário
 */

export const makeIdSanitizer = (): IdSanitizerProtocol => {
  return new IdSanitizer();
};
