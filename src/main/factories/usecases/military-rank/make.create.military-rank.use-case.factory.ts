import { CreateMilitaryRankService } from "@application/services";

import type { CreateMilitaryRankUseCase } from "@domain/usecases";

import { makeMilitaryRankRepository } from "@main/factories/repositories";
import { makeCreateMilitaryRankSanitizer } from "@main/factories/sanitizers";
import { makeCreateMilitaryRankValidator } from "@main/factories/validators";

/**
 * 🏭 MAIN LAYER - Factory para Use Case
 *
 * Responsabilidade:
 * - Montar toda a cadeia de dependências
 * - Repository + Sanitizer + Validator → Service
 * - Garantir que todas as dependências estão corretas
 */

export const makeCreateMilitaryRankUseCase = (): CreateMilitaryRankUseCase => {
  // 1. Criar Repository (INFRA layer)
  const militaryRankRepository = makeMilitaryRankRepository();

  // 2. Criar Sanitizer (APPLICATION layer)
  const sanitizer = makeCreateMilitaryRankSanitizer();

  // 3. Criar Validator (APPLICATION layer) - precisa do repository
  const validator = makeCreateMilitaryRankValidator({ militaryRankRepository });

  // 4. Montar o Service com todas as dependências
  const useCase = new CreateMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });

  return useCase;
};
