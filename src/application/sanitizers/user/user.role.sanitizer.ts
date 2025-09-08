import { UserRoleSanitizerProtocol } from "../../../application/protocols";
import { UserRole } from "../../../domain/entities";

export class UserRoleSanitizer implements UserRoleSanitizerProtocol {
  private readonly sanitizeUserRole = (role: UserRole): UserRole => {
    if (!role || typeof role !== "string") return role;

    const sanitizedUserRole = role
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");

    return sanitizedUserRole as UserRole;
  };

  public readonly sanitize = (role: UserRole): UserRole => {
    return this.sanitizeUserRole(role);
  };
}
