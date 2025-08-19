import { UpdateMilitaryRankService } from "@application/services";

import type { UpdateMilitaryRankUseCase } from "@domain/usecases";

import { makeMilitaryRankRepository } from "@main/factories/repositories";
import {
  makeIdSanitizer,
  makeMilitaryRankInputDTOSanitizer,
} from "@main/factories/sanitizers";
import {
  makeMilitaryRankValidator,
  makeUUIDIdValidator,
} from "@main/factories/validators";

/**
 * 🏭 MAIN LAYER - Factory para Use Case
 *
 * Responsabilidade:
 * - Montar toda a cadeia de dependências
 * - Repository + Sanitizer + Validator → Service
 * - Garantir que todas as dependências estão corretas
 */

export const makeUpdateMilitaryRankUseCase = (): UpdateMilitaryRankUseCase => {
  // 1. Criar Repository (INFRA layer)
  const militaryRankRepository = makeMilitaryRankRepository();

  // 2. Criar Sanitizer (APPLICATION layer)
  const dataSanitizer = makeMilitaryRankInputDTOSanitizer();

  // 3. Criar Sanitizer (APPLICATION layer)
  const idSanitizer = makeIdSanitizer();

  // 4. Criar Validator (APPLICATION layer)
  const idValidator = makeUUIDIdValidator();

  // 5. Criar Validator (APPLICATION layer) - precisa do repository
  const dataValidator = makeMilitaryRankValidator({ militaryRankRepository });

  // 6. Montar o Service com todas as dependências
  const useCase = new UpdateMilitaryRankService({
    militaryRankRepository,
    dataSanitizer,
    idSanitizer,
    dataValidator,
    idValidator,
  });

  return useCase;
};
