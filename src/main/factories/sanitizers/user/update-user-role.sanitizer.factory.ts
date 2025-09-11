import { UpdateUserRoleSanitizerProtocol } from "src/application/protocols";

import { UpdateUserRoleSanitizer } from "../../../../application/sanitizers/user";

export const makeUpdateUserRoleSanitizer =
  (): UpdateUserRoleSanitizerProtocol => {
    return new UpdateUserRoleSanitizer();
  };
