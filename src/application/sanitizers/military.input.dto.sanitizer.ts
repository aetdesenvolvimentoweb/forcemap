import { MilitaryInputDTO } from "../../domain/dtos";
import {
  IdSanitizerProtocol,
  MilitaryInputDTOSanitizerProtocol,
} from "../protocols";
import { sanitizeNumber, sanitizeString } from "../utils";

interface MilitaryInputDTOSanitizerProps {
  idSanitizer: IdSanitizerProtocol;
}

export class MilitaryInputDTOSanitizer
  implements MilitaryInputDTOSanitizerProtocol
{
  constructor(private readonly props: MilitaryInputDTOSanitizerProps) {}

  public readonly sanitize = (data: MilitaryInputDTO): MilitaryInputDTO => {
    const sanitized = {
      militaryRankId: this.props.idSanitizer.sanitize(data.militaryRankId),
      name: sanitizeString(data.name),
      rg: sanitizeNumber(data.rg),
    };
    return sanitized;
  };
}
