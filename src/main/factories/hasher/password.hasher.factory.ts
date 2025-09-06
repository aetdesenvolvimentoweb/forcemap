import { PasswordHasherProtocol } from "../../../application/protocols";
import { BcryptPasswordHasherAdapter } from "../../../infra/adapters/bcrypt.password.hasher.adapter";

export const makePasswordHasher = (): PasswordHasherProtocol => {
  return new BcryptPasswordHasherAdapter();
};
