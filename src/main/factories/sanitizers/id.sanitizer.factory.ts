import { IdSanitizerProtocol } from "../../../application/protocols";
import { IdSanitizer } from "../../../application/sanitizers";

export const makeIdSanitizer = (): IdSanitizerProtocol => {
  return new IdSanitizer();
};
