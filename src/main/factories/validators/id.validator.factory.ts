import { IdValidatorProtocol } from "../../../application/protocols";
import { UUIDIdValidatorAdapter } from "../../../infra/adapters";

export const makeIdValidator = (): IdValidatorProtocol => {
  return new UUIDIdValidatorAdapter();
};
