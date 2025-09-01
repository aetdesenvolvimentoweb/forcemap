import { MilitaryRankInputDTO } from "../../domain/dtos";
import { MilitaryRankInputDTOSanitizerProtocol } from "../protocols";

export class MilitaryRankInputDTOSanitizer
  implements MilitaryRankInputDTOSanitizerProtocol
{
  private readonly sanitizeAbbreviation = (abbreviation: string): string => {
    if (!abbreviation || typeof abbreviation !== "string") return abbreviation;

    return abbreviation
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");
  };

  private readonly sanitizeOrder = (order: number): number => {
    return typeof order === "string" ? parseFloat(order) : order;
  };

  public readonly sanitize = (
    data: MilitaryRankInputDTO,
  ): MilitaryRankInputDTO => {
    const sanitized = {
      abbreviation: this.sanitizeAbbreviation(data.abbreviation),
      order: this.sanitizeOrder(data.order),
    };
    return sanitized;
  };
}
