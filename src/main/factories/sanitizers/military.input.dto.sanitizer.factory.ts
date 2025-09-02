import { MilitaryInputDTOSanitizerProtocol } from "../../../application/protocols";
import {
  IdSanitizer,
  MilitaryInputDTOSanitizer,
} from "../../../application/sanitizers";

export const makeMilitaryInputDTOSanitizer =
  (): MilitaryInputDTOSanitizerProtocol => {
    const idSanitizer = new IdSanitizer();
    return new MilitaryInputDTOSanitizer({
      idSanitizer,
    });
  };
