import type { RouteConfig, RouteRegistry } from "@presentation/protocols";

/**
 * 🚀 MAIN LAYER - Route Registry Implementation
 *
 * Responsabilidade:
 * - Implementar o protocolo RouteRegistry definido em PRESENTATION
 * - Gerenciar registro de rotas de forma agnóstica a framework
 * - Permitir que controllers sejam registrados sem conhecer Express
 * - Facilitar testes e organização
 *
 * Esta implementação fica na MAIN porque:
 * - É uma implementação concreta (não um protocolo)
 * - Faz parte da composição da aplicação
 * - Pode ser substituída por outras implementações se necessário
 */

export class DefaultRouteRegistry implements RouteRegistry {
  private readonly routes: RouteConfig[] = [];

  register(config: RouteConfig): void {
    console.log(
      `📝 [MAIN-REGISTRY] Registrando rota: ${config.method} ${config.path}`,
    );
    this.routes.push(config);
  }

  getRoutes(): RouteConfig[] {
    return [...this.routes]; // Retorna cópia para imutabilidade
  }

  // Método helper para buscar rotas por método
  getRoutesByMethod(method: RouteConfig["method"]): RouteConfig[] {
    return this.routes.filter((route) => route.method === method);
  }

  // Método helper para buscar rota específica
  findRoute(
    method: RouteConfig["method"],
    path: string,
  ): RouteConfig | undefined {
    return this.routes.find(
      (route) => route.method === method && route.path === path,
    );
  }

  // Método helper para debugging
  logRoutes(): void {
    console.log(
      `📋 [MAIN-REGISTRY] Total de rotas registradas: ${this.routes.length}`,
    );
    this.routes.forEach((route, index) => {
      console.log(`  ${index + 1}. ${route.method} ${route.path}`);
    });
  }
}
