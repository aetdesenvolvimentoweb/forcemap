/**
 * 🏭 MAIN LAYER - Factory para Validator
 *
 * Responsabilidade:
 * - Criar instância do validator
 * - Injetar repository (dependency injection)
 */

import { IdValidatorProtocol } from "@application/protocols";

import { UUIDIdValidatorAdapter } from "@infra/adapters";

export const makeUUIDIdValidator = (): IdValidatorProtocol => {
  return new UUIDIdValidatorAdapter();
};
