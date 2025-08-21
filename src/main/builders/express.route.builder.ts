import { InvalidParamError } from "@application/errors";

import { RouteRegistry } from "@presentation/protocols";

import { adaptExpressRoute } from "@infra/adapters";

import type { Express, Request, Response } from "express";

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
    private readonly app: Express,
    private readonly routeRegistry: RouteRegistry,
  ) {}

  /**
   * Aplica todas as rotas registradas no RouteRegistry ao Express app
   */
  build(): void {
    const routes = this.routeRegistry.getRoutes();

    if (routes.length === 0) {
      return;
    }

    routes.forEach((route) => {
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
          throw new InvalidParamError(
            "Método HTTP",
            `"${route.method}" não é suportado. Métodos válidos: GET, POST, PUT, DELETE, PATCH`,
          );
      }
    });
  }

  /**
   * Método helper para adicionar prefix nas rotas
   */
  buildWithPrefix(prefix: string): void {
    this.applyRoutes({ prefix });
  }

  /**
   * Método para aplicar rotas com middlewares específicos
   */
  buildWithMiddlewares(middlewares: unknown[]): void {
    this.applyRoutes({ middlewares });
  }

  /**
   * Método privado que centraliza a lógica de aplicação de rotas
   */
  private applyRoutes(
    options: {
      prefix?: string;
      middlewares?: unknown[];
    } = {},
  ): void {
    const { prefix = "", middlewares = [] } = options;

    const routes = this.routeRegistry.getRoutes();

    if (routes.length === 0) {
      return;
    }

    routes.forEach((route) => {
      const fullPath = prefix ? `${prefix}${route.path}` : route.path;

      const expressHandler = adaptExpressRoute(route.controller);

      this.applyRouteByMethod(
        route.method,
        fullPath,
        middlewares,
        expressHandler,
      );
    });
  }

  /**
   * Método privado que aplica a rota no Express baseado no método HTTP
   */
  private applyRouteByMethod(
    method: string,
    path: string,
    middlewares: unknown[],
    handler: (req: Request, res: Response) => void,
  ): void {
    const args =
      middlewares.length > 0
        ? [path, ...middlewares, handler]
        : [path, handler];

    switch (method) {
      case "GET":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.get(...(args as [any, ...any[]]));
        break;
      case "POST":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.post(...(args as [any, ...any[]]));
        break;
      case "PUT":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.put(...(args as [any, ...any[]]));
        break;
      case "DELETE":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.delete(...(args as [any, ...any[]]));
        break;
      case "PATCH":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.app.patch(...(args as [any, ...any[]]));
        break;
      default:
        throw new InvalidParamError(
          "Método HTTP",
          `"${method}" não é suportado. Métodos válidos: GET, POST, PUT, DELETE, PATCH`,
        );
    }
  }
}
