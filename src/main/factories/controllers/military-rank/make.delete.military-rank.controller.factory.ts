import { MilitaryRank } from "@domain/entities";

import { DeleteMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";

import { makeDeleteMilitaryRankUseCase } from "@main/factories/usecases";

interface MakeDeleteMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
}

/**
 * 🏭 MAIN LAYER - Factory para Controller
 *
 * Responsabilidade:
 * - Criar controller
 * - Injetar use case (já com todas as dependências montadas)
 * - Injetar response factory
 */

export const makeDeleteMilitaryRankController = ({
  httpResponseFactory,
}: MakeDeleteMilitaryRankControllerProps): Controller<
  string,
  MilitaryRank | null
> => {
  // Use case vem pronto, com todas as dependências montadas
  const deleteMilitaryRankUseCase = makeDeleteMilitaryRankUseCase();

  const controller = new DeleteMilitaryRankController({
    httpResponseFactory,
    deleteMilitaryRankService: deleteMilitaryRankUseCase,
  });

  return controller;
};
