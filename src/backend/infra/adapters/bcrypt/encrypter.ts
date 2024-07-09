import { Encrypter } from "@/backend/domain/usecases";
import { hash } from "bcrypt";

export class BcryptEncrypterAdapter implements Encrypter {
  public readonly encrypt = async (password: string): Promise<string> => {
    return await hash(password, 10);
  };
}
