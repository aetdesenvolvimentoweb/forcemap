import type { MilitaryRankInputDTOSanitizerProtocol } from "@application/protocols";
import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";

/**
 * 🏭 MAIN LAYER - Factory para Sanitizer
 *
 * Responsabilidade:
 * - Criar instância do sanitizer
 * - Configurar dependências se necessário
 */

export const makeMilitaryRankInputDTOSanitizer =
  (): MilitaryRankInputDTOSanitizerProtocol => {
    return new MilitaryRankInputDTOSanitizer();
  };
