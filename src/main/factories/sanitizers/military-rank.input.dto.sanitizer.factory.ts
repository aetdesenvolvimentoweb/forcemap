import {
  LoggerProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
} from "src/application/protocols";
import { MilitaryRankInputDTOSanitizer } from "src/application/sanitizers";

export const makeMilitaryRankInputDTOSanitizer = (
  logger: LoggerProtocol,
): MilitaryRankInputDTOSanitizerProtocol => {
  return new MilitaryRankInputDTOSanitizer(logger);
};
