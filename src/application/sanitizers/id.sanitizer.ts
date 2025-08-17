import { IdSanitizerProtocol } from "@application/protocols";

export class IdSanitizer implements IdSanitizerProtocol {
  public readonly sanitize = (id: string): string => {
    return id.trim();
  };
}
