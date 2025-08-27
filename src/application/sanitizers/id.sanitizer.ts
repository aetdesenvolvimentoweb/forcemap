import { IdSanitizerProtocol, LoggerProtocol } from "../protocols";

export class IdSanitizer implements IdSanitizerProtocol {
  private readonly logger: LoggerProtocol;

  constructor(logger: LoggerProtocol) {
    this.logger = logger;
  }

  public readonly sanitize = (id: string): string => {
    this.logger.info("Sanitizing ID", { input: id });
    if (!id || typeof id !== "string") return id;

    const sanitized = id
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");

    this.logger.info("Sanitized ID", { output: sanitized });
    return sanitized;
  };
}
