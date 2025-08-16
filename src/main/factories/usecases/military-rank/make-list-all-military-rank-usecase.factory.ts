import { ListAllMilitaryRankService } from "@application/services";

import { ListAllMilitaryRankUseCase } from "@domain/usecases";

import { makeMilitaryRankRepository } from "@main/factories/repositories";

/**
 * 🏭 MAIN LAYER - Factory para Use Case
 *
 * Responsabilidade:
 * - Montar toda a cadeia de dependências
 * - Repository + Sanitizer + Validator → Service
 * - Garantir que todas as dependências estão corretas
 */

export const makeListAllMilitaryRankUseCase =
  (): ListAllMilitaryRankUseCase => {
    // 1. Criar Repository (INFRA layer)
    const militaryRankRepository = makeMilitaryRankRepository();

    // 2. Montar o Service com todas as dependências
    const useCase = new ListAllMilitaryRankService({
      militaryRankRepository,
    });

    return useCase;
  };
