import { MilitaryRankInputDTOSanitizerProtocol } from "../../../application/protocols";
import { MilitaryRankInputDTOSanitizer } from "../../../application/sanitizers";

export const makeMilitaryRankInputDTOSanitizer =
  (): MilitaryRankInputDTOSanitizerProtocol => {
    return new MilitaryRankInputDTOSanitizer();
  };
