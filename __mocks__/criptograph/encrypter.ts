import { Encrypter } from "@/backend/domain/usecases";

export class EncrypterStub implements Encrypter {
  public readonly encrypt = async (password: string): Promise<string> => {
    return new Promise((resolve) => resolve(password + "-hashed"));
  };
}
