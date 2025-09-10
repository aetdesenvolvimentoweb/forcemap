import {
  JsonWebTokenError,
  sign,
  SignOptions,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";

import { JWTPayload, RefreshTokenPayload } from "../../../domain/entities";
import { InvalidParamError, UnauthorizedError } from "../../errors";
import { JWTProtocol } from "../../protocols/jwt.protocol";

export class JWTService implements JWTProtocol {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || "your-access-secret";
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
  }

  public readonly generateAccessToken = (
    payload: Omit<JWTPayload, "iat" | "exp">,
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

  public readonly verifyAccessToken = (token: string): JWTPayload => {
    try {
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Token de acesso obrigatório");
      }

      const decoded = verify(token, this.accessTokenSecret, {
        issuer: "forcemap-api",
        audience: "forcemap-client",
      }) as JWTPayload;

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
