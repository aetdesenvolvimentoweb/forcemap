import {
  IdSanitizerProtocol,
  UserInputDTOSanitizerProtocol,
} from "../../../../application/protocols";
import { UserInputDTOSanitizer } from "../../../../application/sanitizers";

export const makeUserInputDTOSanitizer = (
  idSanitizer: IdSanitizerProtocol,
): UserInputDTOSanitizerProtocol => {
  return new UserInputDTOSanitizer({
    idSanitizer,
  });
};
