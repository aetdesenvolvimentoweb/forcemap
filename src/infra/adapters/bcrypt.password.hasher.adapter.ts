import * as bcrypt from "bcrypt";

import { PasswordHasherProtocol } from "../../application/protocols";

export class BcryptPasswordHasherAdapter implements PasswordHasherProtocol {
  constructor(private readonly saltRounds: number = 12) {}

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
