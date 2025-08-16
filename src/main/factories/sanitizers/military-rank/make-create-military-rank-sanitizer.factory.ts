import type { CreateMilitaryRankSanitizerProtocol } from "@application/protocols";
import { CreateMilitaryRankSanitizer } from "@application/sanitizers";

/**
 * 🏭 MAIN LAYER - Factory para Sanitizer
 *
 * Responsabilidade:
 * - Criar instância do sanitizer
 * - Configurar dependências se necessário
 */

export const makeCreateMilitaryRankSanitizer =
  (): CreateMilitaryRankSanitizerProtocol => {
    return new CreateMilitaryRankSanitizer();
  };
