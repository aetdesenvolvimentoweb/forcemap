export type UserSession = {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastAccessAt: Date;
};

export type JWTPayload = {
  userId: string;
  sessionId: string;
  role: string;
  militaryId: string;
  iat: number;
  exp: number;
};

export type RefreshTokenPayload = {
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
};
