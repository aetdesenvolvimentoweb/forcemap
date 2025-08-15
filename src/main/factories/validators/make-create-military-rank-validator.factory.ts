import type { CreateMilitaryRankValidatorProtocol } from "@application/protocols";
import { CreateMilitaryRankValidator } from "@application/validators";

import type { MilitaryRankRepository } from "@domain/repositories";

/**
 * 🏭 MAIN LAYER - Factory para Validator
 *
 * Responsabilidade:
 * - Criar instância do validator
 * - Injetar repository (dependency injection)
 */

interface MakeCreateMilitaryRankValidatorProps {
  militaryRankRepository: MilitaryRankRepository;
}

export const makeCreateMilitaryRankValidator = ({
  militaryRankRepository,
}: MakeCreateMilitaryRankValidatorProps): CreateMilitaryRankValidatorProtocol => {
  console.log("🏭 [MAIN] Criando CreateMilitaryRankValidator");
  return new CreateMilitaryRankValidator({ militaryRankRepository });
};
