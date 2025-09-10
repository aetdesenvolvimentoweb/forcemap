import { JWTService } from "../../../../application/services/auth/jwt.service";

export const makeJWTService = (): JWTService => {
  return new JWTService();
};
