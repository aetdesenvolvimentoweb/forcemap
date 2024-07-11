import { HashCompare } from "@/backend/domain/usecases";

export class HashCompareStub implements HashCompare {
  public readonly compare = async (
    value: string,
    hash: string
  ): Promise<boolean> => {
    return new Promise((resolve) => resolve(true));
  };
}
