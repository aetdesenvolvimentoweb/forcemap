import { TokenService } from "../../../../application/services/auth";
import { makeJWTService } from "./jwt.service.factory";

export const makeTokenService = (): TokenService => {
  const jwtService = makeJWTService();

  return new TokenService({
    jwtService,
  });
};
