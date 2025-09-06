import { UserCredentialsInputDTOSanitizerProtocol } from "../../../../application/protocols";
import { UserCredentialsInputDTOSanitizer } from "../../../../application/sanitizers";

export const makeUserCredentialsInputDTOSanitizer =
  (): UserCredentialsInputDTOSanitizerProtocol => {
    return new UserCredentialsInputDTOSanitizer();
  };
