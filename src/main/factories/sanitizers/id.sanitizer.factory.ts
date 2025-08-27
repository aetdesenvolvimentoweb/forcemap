import {
  IdSanitizerProtocol,
  LoggerProtocol,
} from "../../../application/protocols";
import { IdSanitizer } from "../../../application/sanitizers";

export const makeIdSanitizer = (
  logger: LoggerProtocol,
): IdSanitizerProtocol => {
  return new IdSanitizer(logger);
};
