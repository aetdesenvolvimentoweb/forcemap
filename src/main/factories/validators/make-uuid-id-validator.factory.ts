import { IdValidatorProtocol } from "@application/protocols/validators/id.validator.protocol";

import { UUIDIdValidatorAdapter } from "@infra/adapters/uuid-id.validator.adapter";

/**
 * 🏭 MAIN LAYER - Factory para Validator
 *
 * Responsabilidade:
 * - Criar instância do validator
 * - Injetar repository (dependency injection)
 */

export const makeUUIDIdValidator = (): IdValidatorProtocol => {
  return new UUIDIdValidatorAdapter();
};
