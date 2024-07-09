import { Encrypter } from "@/backend/domain/usecases";

export class EncrypterStub implements Encrypter {
  async encrypt(password: string): Promise<string> {
    return password + "-hashed";
  }
}
