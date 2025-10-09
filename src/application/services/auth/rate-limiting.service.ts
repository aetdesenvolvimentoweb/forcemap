import {
  DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
  DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
  DEFAULT_LOGIN_WINDOW_MS,
} from "../../../domain/constants";
import { TooManyRequestsError } from "../../errors";
import { RateLimiterProtocol, SecurityLoggerProtocol } from "../../protocols";

interface RateLimitingServiceDependencies {
  rateLimiter: RateLimiterProtocol;
  securityLogger: SecurityLoggerProtocol;
}

interface RateLimitKeys {
  ipLimitKey: string;
  rgLimitKey: string;
}

/**
 * Serviço responsável por gerenciar rate limiting em tentativas de login.
 *
 * Implementa proteção contra força bruta através de:
 * - Rate limiting por IP
 * - Rate limiting por usuário (RG)
 * - Logging de tentativas bloqueadas
 */
export class RateLimitingService {
  constructor(private readonly dependencies: RateLimitingServiceDependencies) {}

  /**
   * Valida se o IP e RG podem fazer uma nova tentativa de login.
   *
   * @throws {TooManyRequestsError} Quando rate limit é excedido
   */
  public readonly validateLoginAttempt = async (
    ipAddress: string,
    rg: number,
  ): Promise<RateLimitKeys> => {
    const { rateLimiter, securityLogger } = this.dependencies;

    const ipMaxAttempts =
      Number(process.env.RATE_LIMIT_LOGIN_IP_MAX_ATTEMPTS) ||
      DEFAULT_LOGIN_IP_MAX_ATTEMPTS;
    const userMaxAttempts =
      Number(process.env.RATE_LIMIT_LOGIN_USER_MAX_ATTEMPTS) ||
      DEFAULT_LOGIN_USER_MAX_ATTEMPTS;
    const windowMs = DEFAULT_LOGIN_WINDOW_MS;

    const ipLimitKey = `login:ip:${ipAddress}`;
    const ipLimit = await rateLimiter.checkLimit(
      ipLimitKey,
      ipMaxAttempts,
      windowMs,
    );

    if (!ipLimit.allowed) {
      securityLogger.logLoginBlocked(
        ipAddress,
        undefined,
        "Rate limit por IP excedido",
      );
      throw new TooManyRequestsError(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(
          (ipLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    const rgLimitKey = `login:rg:${rg}`;
    const rgLimit = await rateLimiter.checkLimit(
      rgLimitKey,
      userMaxAttempts,
      windowMs,
    );

    if (!rgLimit.allowed) {
      securityLogger.logLoginBlocked(
        `RG:${rg}`,
        undefined,
        "Rate limit por usuário excedido",
      );
      throw new TooManyRequestsError(
        `Muitas tentativas para este usuário. Tente novamente em ${Math.ceil(
          (rgLimit.resetTime.getTime() - Date.now()) / 60000,
        )} minutos.`,
      );
    }

    return { ipLimitKey, rgLimitKey };
  };

  /**
   * Registra uma tentativa de login falhada.
   */
  public readonly recordFailedAttempt = async (
    keys: RateLimitKeys,
  ): Promise<void> => {
    const { rateLimiter } = this.dependencies;
    await rateLimiter.recordAttempt(keys.ipLimitKey, DEFAULT_LOGIN_WINDOW_MS);
    await rateLimiter.recordAttempt(keys.rgLimitKey, DEFAULT_LOGIN_WINDOW_MS);
  };

  /**
   * Reseta os contadores de rate limit após login bem-sucedido.
   */
  public readonly resetLimits = async (keys: RateLimitKeys): Promise<void> => {
    const { rateLimiter } = this.dependencies;
    await rateLimiter.reset(keys.ipLimitKey);
    await rateLimiter.reset(keys.rgLimitKey);
  };
}
