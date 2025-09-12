import { MilitaryRankInputDTO } from "../../domain/dtos";
import { MilitaryRankInputDTOSanitizerProtocol } from "../protocols";
import { sanitizeNumber, sanitizeString } from "../utils";

export class MilitaryRankInputDTOSanitizer
  implements MilitaryRankInputDTOSanitizerProtocol
{
  public readonly sanitize = (
    data: MilitaryRankInputDTO,
  ): MilitaryRankInputDTO => {
    const sanitized = {
      abbreviation: sanitizeString(data.abbreviation),
      order: sanitizeNumber(data.order),
    };
    return sanitized;
  };
}
