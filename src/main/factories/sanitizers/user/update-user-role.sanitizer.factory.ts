import { UpdateUserRoleSanitizerProtocol } from "src/application/protocols";

import { UpdateUserRoleSanitizer } from "../../../../application/sanitizers/user";

export const makeUserRoleSanitizer = (): UpdateUserRoleSanitizerProtocol => {
  return new UpdateUserRoleSanitizer();
};
