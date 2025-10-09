/**
 * Constantes padrão para rate limiting
 */

/**
 * Máximo de tentativas de login por IP (padrão: 10)
 */
export const DEFAULT_LOGIN_IP_MAX_ATTEMPTS = 10;

/**
 * Máximo de tentativas de login por usuário/RG (padrão: 5)
 */
export const DEFAULT_LOGIN_USER_MAX_ATTEMPTS = 5;

/**
 * Janela de tempo para rate limit em minutos (padrão: 15)
 */
export const DEFAULT_LOGIN_WINDOW_MINUTES = 15;

/**
 * Janela de tempo para rate limit em milissegundos (15 minutos)
 */
export const DEFAULT_LOGIN_WINDOW_MS = 15 * 60 * 1000;
