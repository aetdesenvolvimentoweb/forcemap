import { JWTProtocol } from "../protocols";

export interface TokenPayload {
  userId: string;
  sessionId: string;
  role: string;
  militaryId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

interface TokenAdapterDependencies {
  jwtService: JWTProtocol;
}

export class TokenAdapter {
  constructor(private readonly dependencies: TokenAdapterDependencies) {}

  public readonly generateAccessToken = (payload: TokenPayload): string => {
    return this.dependencies.jwtService.generateAccessToken(payload);
  };

  public readonly generateRefreshToken = (
    payload: RefreshTokenPayload,
  ): string => {
    return this.dependencies.jwtService.generateRefreshToken(payload);
  };

  public readonly verifyAccessToken = (token: string): TokenPayload => {
    return this.dependencies.jwtService.verifyAccessToken(token);
  };

  public readonly verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return this.dependencies.jwtService.verifyRefreshToken(token);
  };
}
