import { JWTProtocol } from "../../../../application/protocols/jwt.protocol";
import { JsonWebTokenJWTAdapter } from "../../../../infra/adapters/jsonwebtoken.jwt.adapter";

export const makeJWTService = (): JWTProtocol => {
  return new JsonWebTokenJWTAdapter();
};
