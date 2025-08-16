import type { CreateMilitaryRankInputDTO } from "@domain/dtos";

import { CreateMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";

import { makeCreateMilitaryRankUseCase } from "../usecases";

interface MakeCreateMilitaryRankControllerProps {
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

export const makeCreateMilitaryRankController = ({
  httpResponseFactory,
}: MakeCreateMilitaryRankControllerProps): Controller<
  CreateMilitaryRankInputDTO,
  null
> => {
  // Use case vem pronto, com todas as dependências montadas
  const createMilitaryRankUseCase = makeCreateMilitaryRankUseCase();

  const controller = new CreateMilitaryRankController({
    httpResponseFactory,
    createMilitaryRankService: createMilitaryRankUseCase,
  });

  return controller;
};
