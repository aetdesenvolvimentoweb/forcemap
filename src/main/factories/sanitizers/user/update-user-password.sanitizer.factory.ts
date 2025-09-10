import { UpdateUserPasswordSanitizerProtocol } from "src/application/protocols";

import { UpdateUserPasswordSanitizer } from "../../../../application/sanitizers/user";

export const makeUpdateUserPasswordSanitizer =
  (): UpdateUserPasswordSanitizerProtocol => {
    return new UpdateUserPasswordSanitizer();
  };
