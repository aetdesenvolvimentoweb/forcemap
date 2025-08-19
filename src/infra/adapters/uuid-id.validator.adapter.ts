import { InvalidParamError } from "@application/errors";
import { IdValidatorProtocol } from "@application/protocols";

/**
 * Adaptador para validação de UUID usando crypto
 */
export class UUIDIdValidatorAdapter implements IdValidatorProtocol {
  public async validate(id: string): Promise<void> {
    // O método validate do crypto retorna true para UUID válido
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(id)) {
      throw new InvalidParamError("ID", "Erro no formato.");
    }
  }
}
