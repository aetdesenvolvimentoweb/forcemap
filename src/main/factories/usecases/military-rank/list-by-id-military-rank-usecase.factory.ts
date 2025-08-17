import { ListByIdMilitaryRankService } from "@application/services/military-rank/list.by.id.military-rank.service";

import type { ListByIdMilitaryRankUseCase } from "@domain/usecases";

import { makeMilitaryRankRepository } from "@main/factories/repositories";
import { makeIdSanitizer } from "@main/factories/sanitizers";
import { makeMongoDbIdValidator } from "@main/factories/validators";

/**
 * 🏭 MAIN LAYER - Factory para Use Case
 *
 * Responsabilidade:
 * - Montar toda a cadeia de dependências
 * - Repository + Sanitizer + Validator → Service
 * - Garantir que todas as dependências estão corretas
 */

export const makeListByIdMilitaryRankUseCase =
  (): ListByIdMilitaryRankUseCase => {
    // 1. Criar Repository (INFRA layer)
    const militaryRankRepository = makeMilitaryRankRepository();

    // 2. Criar Sanitizer (APPLICATION layer)
    const sanitizer = makeIdSanitizer();

    // 3. Criar Validator (APPLICATION layer) - precisa do repository
    const validator = makeMongoDbIdValidator();

    // 4. Montar o Service com todas as dependências
    const useCase = new ListByIdMilitaryRankService({
      militaryRankRepository,
      sanitizer,
      validator,
    });

    return useCase;
  };
