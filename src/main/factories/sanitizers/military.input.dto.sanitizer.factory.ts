import { MilitaryInputDTOSanitizerProtocol } from "../../../application/protocols";
import { MilitaryInputDTOSanitizer } from "../../../application/sanitizers";
import { makeIdSanitizer } from "./id.sanitizer.factory";

export const makeMilitaryInputDTOSanitizer =
  (): MilitaryInputDTOSanitizerProtocol => {
    const idSanitizer = makeIdSanitizer();
    return new MilitaryInputDTOSanitizer({
      idSanitizer,
    });
  };
