import { UpdateUserPasswordSanitizerProtocol } from "src/application/protocols";
import { UpdateUserPasswordSanitizer } from "src/application/sanitizers";

export const makeUpdateUserPasswordSanitizer =
  (): UpdateUserPasswordSanitizerProtocol => {
    return new UpdateUserPasswordSanitizer();
  };
