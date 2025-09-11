import { TokenAdapter } from "../../../application/adapters/token.adapter";
import { makeJWTService } from "../services/auth/jwt.service.factory";

export const makeTokenAdapter = (): TokenAdapter => {
  const jwtService = makeJWTService();

  return new TokenAdapter({
    jwtService,
  });
};
