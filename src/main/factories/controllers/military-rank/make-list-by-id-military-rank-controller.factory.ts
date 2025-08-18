import { MilitaryRank } from "@domain/entities";

import { ListByIdMilitaryRankController } from "@presentation/controllers/military-rank/list.by.id.military-rank.controller";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";

import { makeListByIdMilitaryRankUseCase } from "@main/factories/usecases/military-rank/make-list-by-id-military-rank-usecase.factory";

interface MakeListByIdMilitaryRankControllerProps {
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

export const makeListByIdMilitaryRankController = ({
  httpResponseFactory,
}: MakeListByIdMilitaryRankControllerProps): Controller<
  string,
  MilitaryRank | null
> => {
  // Use case vem pronto, com todas as dependências montadas
  const listByIdMilitaryRankUseCase = makeListByIdMilitaryRankUseCase();

  const controller = new ListByIdMilitaryRankController({
    httpResponseFactory,
    listByIdMilitaryRankService: listByIdMilitaryRankUseCase,
  });

  return controller;
};
