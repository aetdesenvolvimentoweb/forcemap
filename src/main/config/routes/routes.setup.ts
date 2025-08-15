import type { RouteRegistry } from "@presentation/protocols";

import { setupMilitaryRankRoutes } from "./military-rank-route.setup";

/**
 * 🚀 MAIN LAYER - Central Route Setup
 *
 * Responsabilidade:
 * - Centralizar registro de todas as rotas da aplicação
 * - Organizar setups por domínio
 * - Simplificar o bootstrap da aplicação
 *
 * Este arquivo atua como um agregador de todos os setups de rotas,
 * facilitando a manutenção e a adição de novos domínios.
 */

export const setupAllRoutes = (routeRegistry: RouteRegistry): void => {
  console.log("🚀 [MAIN] Configurando todas as rotas da aplicação...");

  // Military Rank Domain Routes
  setupMilitaryRankRoutes(routeRegistry);

  // Futuras rotas de outros domínios:
  // setupUserRoutes(routeRegistry);
  // setupOrganizationRoutes(routeRegistry);
  // setupReportRoutes(routeRegistry);
  // setupAuthRoutes(routeRegistry);

  const totalRoutes = routeRegistry.getRoutes().length;
  console.log(`📋 [MAIN] ${totalRoutes} rotas registradas com sucesso!`);

  // Log detalhado das rotas (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log("📋 [MAIN] Rotas registradas:");
    routeRegistry.getRoutes().forEach((route, index) => {
      console.log(`  ${index + 1}. ${route.method} ${route.path}`);
    });
  }
};
