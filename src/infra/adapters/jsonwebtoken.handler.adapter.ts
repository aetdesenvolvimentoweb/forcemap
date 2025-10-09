import {
  JsonWebTokenError,
  sign,
  SignOptions,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";

import { InvalidParamError, UnauthorizedError } from "../../application/errors";
import { TokenHandlerProtocol } from "../../application/protocols";
import { Payload, RefreshTokenPayload } from "../../domain/entities";
import { ConfigurationError } from "../errors";

export class JsonWebTokenHandlerAdapter implements TokenHandlerProtocol {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const nodeEnv = process.env.NODE_ENV;

    // Validação obrigatória de secrets
    if (!accessSecret || !refreshSecret) {
      throw new ConfigurationError(
        "JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser configurados via variáveis de ambiente",
      );
    }

    // Validação de tamanho mínimo em produção
    if (nodeEnv === "production") {
      if (accessSecret.length < 32) {
        throw new ConfigurationError(
          "JWT_ACCESS_SECRET deve ter no mínimo 32 caracteres em produção",
        );
      }

      if (refreshSecret.length < 32) {
        throw new ConfigurationError(
          "JWT_REFRESH_SECRET deve ter no mínimo 32 caracteres em produção",
        );
      }
    }

    this.accessTokenSecret = accessSecret;
    this.refreshTokenSecret = refreshSecret;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
  }

  public readonly generateAccessToken = (
    payload: Omit<Payload, "iat" | "exp">,
  ): string => {
    try {
      return sign(payload as Record<string, unknown>, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: "forcemap-api",
        audience: "forcemap-client",
      } as SignOptions);
    } catch {
      throw new InvalidParamError("Payload do token", "inválido para geração");
    }
  };

  public readonly generateRefreshToken = (
    payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  ): string => {
    try {
      return sign(payload as Record<string, unknown>, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: "forcemap-api",
        audience: "forcemap-client",
      } as SignOptions);
    } catch {
      throw new InvalidParamError(
        "Payload do refresh token",
        "inválido para geração",
      );
    }
  };

  public readonly verifyAccessToken = (token: string): Payload => {
    try {
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Token de acesso obrigatório");
      }

      const decoded = verify(token, this.accessTokenSecret, {
        issuer: "forcemap-api",
        audience: "forcemap-client",
      }) as Payload;

      if (
        !decoded.userId ||
        !decoded.sessionId ||
        !decoded.role ||
        !decoded.militaryId
      ) {
        throw new UnauthorizedError("Token de acesso inválido");
      }

      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError("Token de acesso expirado");
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError("Token de acesso inválido");
      }

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Erro na validação do token de acesso");
    }
  };

  public readonly verifyRefreshToken = (token: string): RefreshTokenPayload => {
    try {
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Refresh token obrigatório");
      }

      const decoded = verify(token, this.refreshTokenSecret, {
        issuer: "forcemap-api",
        audience: "forcemap-client",
      }) as RefreshTokenPayload;

      if (!decoded.userId || !decoded.sessionId) {
        throw new UnauthorizedError("Refresh token inválido");
      }

      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError("Refresh token expirado");
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError("Refresh token inválido");
      }

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Erro na validação do refresh token");
    }
  };

  public readonly extractTokenFromHeader = (
    authHeader?: string,
  ): string | null => {
    if (!authHeader || typeof authHeader !== "string") {
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    const token = parts[1];

    if (!token || token.trim().length === 0) {
      return null;
    }

    return token.trim();
  };
}
