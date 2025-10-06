/**
 * Configuração de versionamento da API.
 *
 * Define a versão atual da API e prefixos de rota.
 * Facilita a criação de novas versões no futuro.
 */

/**
 * Versão atual da API
 */
export const API_VERSION = "v1";

/**
 * Prefixo base para todas as rotas da API
 */
export const API_BASE_PATH = "/api";

/**
 * Prefixo completo para rotas versionadas
 * @example "/api/v1"
 */
export const API_VERSIONED_PATH = `${API_BASE_PATH}/${API_VERSION}`;

/**
 * Cria um path completo para uma rota específica
 * @param path - Caminho da rota (ex: "/users", "/auth/login")
 * @returns Path completo com versionamento (ex: "/api/v1/users")
 */
export const createVersionedPath = (path: string): string => {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_VERSIONED_PATH}${cleanPath}`;
};
