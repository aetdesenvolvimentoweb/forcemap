import { HashCompare } from "@/backend/domain/usecases";
import { compare } from "bcrypt";

export class BcryptHashCompareAdapter implements HashCompare {
  public readonly compare = async (
    value: string,
    hash: string
  ): Promise<boolean> => {
    return await compare(value, hash);
  };
}
