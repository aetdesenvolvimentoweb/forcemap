import { UpdateUserRoleSanitizerProtocol } from "src/application/protocols";
import { UpdateUserRoleSanitizer } from "src/application/sanitizers";

export const makeUserRoleSanitizer = (): UpdateUserRoleSanitizerProtocol => {
  return new UpdateUserRoleSanitizer();
};
