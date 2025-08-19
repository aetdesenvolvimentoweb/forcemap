import type { MilitaryRankInputDTO } from "@domain/dtos";

import { UpdateMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";

import { makeUpdateMilitaryRankUseCase } from "@main/factories/usecases";

interface MakeUpdateMilitaryRankControllerProps {
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

export const makeUpdateMilitaryRankController = ({
  httpResponseFactory,
}: MakeUpdateMilitaryRankControllerProps): Controller<
  MilitaryRankInputDTO,
  null
> => {
  // Use case vem pronto, com todas as dependências montadas
  const updateMilitaryRankUseCase = makeUpdateMilitaryRankUseCase();

  const controller = new UpdateMilitaryRankController({
    httpResponseFactory,
    updateMilitaryRankService: updateMilitaryRankUseCase,
  });

  return controller;
};
