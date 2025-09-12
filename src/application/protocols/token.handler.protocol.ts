import { Payload, RefreshTokenPayload } from "../../domain/entities";

export interface TokenHandlerProtocol {
  generateAccessToken(payload: Omit<Payload, "iat" | "exp">): string;
  generateRefreshToken(
    payload: Omit<RefreshTokenPayload, "iat" | "exp">,
  ): string;
  verifyAccessToken(token: string): Payload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
  extractTokenFromHeader(authHeader?: string): string | null;
}
