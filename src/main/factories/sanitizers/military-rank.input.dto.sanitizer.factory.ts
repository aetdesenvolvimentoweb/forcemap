import {
  LoggerProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
} from "../../../application/protocols";
import { MilitaryRankInputDTOSanitizer } from "../../../application/sanitizers";

export const makeMilitaryRankInputDTOSanitizer = (
  logger: LoggerProtocol,
): MilitaryRankInputDTOSanitizerProtocol => {
  return new MilitaryRankInputDTOSanitizer(logger);
};
