import { IdSanitizerProtocol } from "../protocols";

export class IdSanitizer implements IdSanitizerProtocol {
  public readonly sanitize = (id: string): string => {
    if (!id || typeof id !== "string") return id;

    const sanitized = id
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");

    return sanitized;
  };
}
