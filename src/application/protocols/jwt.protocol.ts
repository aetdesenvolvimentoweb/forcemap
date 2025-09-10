import { JWTPayload, RefreshTokenPayload } from "../../domain/entities";

export interface JWTProtocol {
  generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string;
  generateRefreshToken(
    payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  ): string;
  verifyAccessToken(token: string): JWTPayload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
  extractTokenFromHeader(authHeader?: string): string | null;
}
