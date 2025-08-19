import { ObjectId } from "mongodb";

import { InvalidParamError } from "@application/errors";
import { IdValidatorProtocol } from "@application/protocols";

export class MongoDbIdValidatorAdapter implements IdValidatorProtocol {
  public async validate(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new InvalidParamError("ID", "Inválido para MongoDB");
    }
  }
}
