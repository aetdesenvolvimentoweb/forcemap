import { IdValidatorProtocol } from "@application/protocols/validators/id.validator.protocol";

import { MongoDbIdValidatorAdapter } from "@infra/adapters";

/**
 * 🏭 MAIN LAYER - Factory para Validator
 *
 * Responsabilidade:
 * - Criar instância do validator
 * - Injetar repository (dependency injection)
 */

export const makeMongoDbIdValidator = (): IdValidatorProtocol => {
  return new MongoDbIdValidatorAdapter();
};
