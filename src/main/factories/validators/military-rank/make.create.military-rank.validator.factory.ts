import type { MilitaryRankValidatorProtocol } from "@application/protocols";
import { MilitaryRankValidator } from "@application/validators";

import type { MilitaryRankRepository } from "@domain/repositories";

/**
 * 🏭 MAIN LAYER - Factory para Validator
 *
 * Responsabilidade:
 * - Criar instância do validator
 * - Injetar repository (dependency injection)
 */

interface MakeMilitaryRankValidatorProps {
  militaryRankRepository: MilitaryRankRepository;
}

export const makeMilitaryRankValidator = ({
  militaryRankRepository,
}: MakeMilitaryRankValidatorProps): MilitaryRankValidatorProtocol => {
  return new MilitaryRankValidator({ militaryRankRepository });
};
