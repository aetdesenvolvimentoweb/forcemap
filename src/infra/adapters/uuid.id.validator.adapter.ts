import { InvalidParamError } from "../../application/errors";
import { IdValidatorProtocol } from "../../application/protocols";

export class UUIDIdValidatorAdapter implements IdValidatorProtocol {
  public validate = (id: string): void => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(id);

    if (!isValid) {
      throw new InvalidParamError("ID", "formato UUID inválido");
    }
  };
}
