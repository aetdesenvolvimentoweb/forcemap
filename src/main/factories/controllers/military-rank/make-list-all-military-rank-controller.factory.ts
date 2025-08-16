import { MilitaryRank } from "@domain/entities";

import { ListAllMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";

import { makeListAllMilitaryRankUseCase } from "@main/factories/usecases";

interface MakeListAllMilitaryRankControllerProps {
  httpResponseFactory: HttpResponseFactory;
}

export const makeListAllMilitaryRankController = ({
  httpResponseFactory,
}: MakeListAllMilitaryRankControllerProps): Controller<
  null,
  MilitaryRank[]
> => {
  // Use case vem pronto, com todas as dependências montadas
  const listAllMilitaryRankUseCase = makeListAllMilitaryRankUseCase();

  const controller = new ListAllMilitaryRankController({
    httpResponseFactory,
    listAllMilitaryRankService: listAllMilitaryRankUseCase,
  });

  return controller;
};
