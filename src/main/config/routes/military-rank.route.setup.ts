import { HttpResponseFactory } from "@presentation/factories";
import type { Controller, RouteRegistry } from "@presentation/protocols";

import {
  makeCreateMilitaryRankController,
  makeDeleteMilitaryRankController,
  makeListAllMilitaryRankController,
  makeListByIdMilitaryRankController,
  makeUpdateMilitaryRankController,
} from "@main/factories";

/**
 * 📋 MAIN LAYER - Military Rank Route Setup
 *
 * Responsabilidade:
 * - Registrar rotas específicas do domínio Military Rank
 * - Usar factory para criar controllers
 * - Registrar no RouteRegistry da PRESENTATION
 *
 * Esta é a aplicação prática do RouteRegistry:
 * - Controllers são criados via factory (MAIN)
 * - Registrados no RouteRegistry (PRESENTATION)
 * - Aplicados no Express via adapter (INFRA)
 */

export const setupMilitaryRankRoutes = (routeRegistry: RouteRegistry): void => {
  // Criar instância da HttpResponseFactory
  const httpResponseFactory = new HttpResponseFactory();

  // Create Military Rank
  routeRegistry.register({
    method: "POST",
    path: "/military-ranks",
    controller: makeCreateMilitaryRankController({
      httpResponseFactory,
    }) as Controller,
  });

  // ListAll Military Rank
  routeRegistry.register({
    method: "GET",
    path: "/military-ranks",
    controller: makeListAllMilitaryRankController({
      httpResponseFactory,
    }) as Controller,
  });

  // ListById Military Rank
  routeRegistry.register({
    method: "GET",
    path: "/military-ranks/:id",
    controller: makeListByIdMilitaryRankController({
      httpResponseFactory,
    }) as Controller,
  });

  // Delete Military Rank
  routeRegistry.register({
    method: "DELETE",
    path: "/military-ranks/:id",
    controller: makeDeleteMilitaryRankController({
      httpResponseFactory,
    }) as Controller,
  });

  // Update Military Rank
  routeRegistry.register({
    method: "PUT",
    path: "/military-ranks/:id",
    controller: makeUpdateMilitaryRankController({
      httpResponseFactory,
    }) as Controller,
  });
};
