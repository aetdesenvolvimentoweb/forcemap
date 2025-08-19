import { DeleteMilitaryRankService } from "@application/services";

import type { DeleteMilitaryRankUseCase } from "@domain/usecases";

import { makeMilitaryRankRepository } from "@main/factories/repositories";
import { makeIdSanitizer } from "@main/factories/sanitizers";
import { makeUUIDIdValidator } from "@main/factories/validators";

/**
 * 🏭 MAIN LAYER - Factory para Use Case
 *
 * Responsabilidade:
 * - Montar toda a cadeia de dependências
 * - Repository + Sanitizer + Validator → Service
 * - Garantir que todas as dependências estão corretas
 */

export const makeDeleteMilitaryRankUseCase = (): DeleteMilitaryRankUseCase => {
  // 1. Criar Repository (INFRA layer)
  const militaryRankRepository = makeMilitaryRankRepository();

  // 2. Criar Sanitizer (APPLICATION layer)
  const sanitizer = makeIdSanitizer();

  // 3. Criar Validator (APPLICATION layer)
  const validator = makeUUIDIdValidator();

  // 4. Montar o Service com todas as dependências
  const useCase = new DeleteMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });

  return useCase;
};
