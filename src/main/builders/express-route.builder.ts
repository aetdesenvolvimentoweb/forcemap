import { RouteRegistry } from "@presentation/protocols";

import { adaptExpressRoute } from "@infra/adapters";

import type { Application } from "express";

/**
 * 🚀 MAIN LAYER - Express Route Builder
 *
 * Responsabilidade:
 * - Conectar RouteRegistry da PRESENTATION com Express da INFRA
 * - Usar adapter da INFRA para fazer a ponte
 * - Aplicar todas as rotas registradas no Express app
 *
 * Este é o meio termo entre PRESENTATION e INFRA:
 * - Recebe rotas do RouteRegistry (PRESENTATION)
 * - Aplica no Express usando adapter (INFRA)
 */

export class ExpressRouteBuilder {
  constructor(
    private readonly app: Application,
    private readonly routeRegistry: RouteRegistry,
  ) {}

  /**
   * Aplica todas as rotas registradas no RouteRegistry ao Express app
   */
  build(): void {
    console.log("🚀 [MAIN] Construindo rotas do registry para Express...");

    const routes = this.routeRegistry.getRoutes();

    if (routes.length === 0) {
      console.log("⚠️ [MAIN] Nenhuma rota registrada no RouteRegistry");
      return;
    }

    routes.forEach((route) => {
      console.log(`🔗 [MAIN] Aplicando: ${route.method} ${route.path}`);

      // Usa o adapter da INFRA para converter controller
      const expressHandler = adaptExpressRoute(route.controller);

      // Aplica no Express baseado no método
      switch (route.method) {
        case "GET":
          this.app.get(route.path, expressHandler);
          break;
        case "POST":
          this.app.post(route.path, expressHandler);
          break;
        case "PUT":
          this.app.put(route.path, expressHandler);
          break;
        case "DELETE":
          this.app.delete(route.path, expressHandler);
          break;
        case "PATCH":
          this.app.patch(route.path, expressHandler);
          break;
        default:
          console.warn(`⚠️ [MAIN] Método HTTP não suportado: ${route.method}`);
      }
    });

    console.log(`✅ [MAIN] ${routes.length} rotas aplicadas com sucesso!`);
  }

  /**
   * Método helper para adicionar prefix nas rotas
   */
  buildWithPrefix(prefix: string): void {
    console.log(
      `🚀 [MAIN] Construindo rotas com prefix "${prefix}" para Express...`,
    );

    const routes = this.routeRegistry.getRoutes();

    if (routes.length === 0) {
      console.log("⚠️ [MAIN] Nenhuma rota registrada no RouteRegistry");
      return;
    }

    routes.forEach((route) => {
      const fullPath = `${prefix}${route.path}`;
      console.log(`🔗 [MAIN] Aplicando: ${route.method} ${fullPath}`);

      const expressHandler = adaptExpressRoute(route.controller);

      switch (route.method) {
        case "GET":
          this.app.get(fullPath, expressHandler);
          break;
        case "POST":
          this.app.post(fullPath, expressHandler);
          break;
        case "PUT":
          this.app.put(fullPath, expressHandler);
          break;
        case "DELETE":
          this.app.delete(fullPath, expressHandler);
          break;
        case "PATCH":
          this.app.patch(fullPath, expressHandler);
          break;
        default:
          console.warn(`⚠️ [MAIN] Método HTTP não suportado: ${route.method}`);
      }
    });

    console.log(
      `✅ [MAIN] ${routes.length} rotas aplicadas com prefix "${prefix}"!`,
    );
  }

  /**
   * Método para aplicar rotas com middlewares específicos
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildWithMiddlewares(middlewares: any[]): void {
    console.log("🚀 [MAIN] Construindo rotas com middlewares para Express...");

    const routes = this.routeRegistry.getRoutes();

    if (routes.length === 0) {
      console.log("⚠️ [MAIN] Nenhuma rota registrada no RouteRegistry");
      return;
    }

    routes.forEach((route) => {
      console.log(
        `🔗 [MAIN] Aplicando com middlewares: ${route.method} ${route.path}`,
      );

      const expressHandler = adaptExpressRoute(route.controller);

      switch (route.method) {
        case "GET":
          this.app.get(route.path, ...middlewares, expressHandler);
          break;
        case "POST":
          this.app.post(route.path, ...middlewares, expressHandler);
          break;
        case "PUT":
          this.app.put(route.path, ...middlewares, expressHandler);
          break;
        case "DELETE":
          this.app.delete(route.path, ...middlewares, expressHandler);
          break;
        case "PATCH":
          this.app.patch(route.path, ...middlewares, expressHandler);
          break;
        default:
          console.warn(`⚠️ [MAIN] Método HTTP não suportado: ${route.method}`);
      }
    });

    console.log(`✅ [MAIN] ${routes.length} rotas aplicadas com middlewares!`);
  }
}
