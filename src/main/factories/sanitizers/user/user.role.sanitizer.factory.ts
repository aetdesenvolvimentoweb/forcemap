import { UserRoleSanitizerProtocol } from "src/application/protocols";
import { UserRoleSanitizer } from "src/application/sanitizers";

export const makeUserRoleSanitizer = (): UserRoleSanitizerProtocol => {
  return new UserRoleSanitizer();
};
