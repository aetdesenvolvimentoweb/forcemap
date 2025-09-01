import { MilitaryInputDTO } from "../../domain/dtos";
import {
  IdSanitizerProtocol,
  MilitaryInputDTOSanitizerProtocol,
} from "../protocols";

interface MilitaryInputDTOSanitizerProps {
  idSanitizer: IdSanitizerProtocol;
}

export class MilitaryInputDTOSanitizer
  implements MilitaryInputDTOSanitizerProtocol
{
  constructor(private readonly props: MilitaryInputDTOSanitizerProps) {}

  private readonly sanitizeName = (name: string): string => {
    if (!name || typeof name !== "string") return name;

    return name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");
  };

  private readonly sanitizeRg = (rg: number): number => {
    return typeof rg === "string" ? parseFloat(rg) : rg;
  };

  public readonly sanitize = (data: MilitaryInputDTO): MilitaryInputDTO => {
    const sanitized = {
      militaryRankId: this.props.idSanitizer.sanitize(data.militaryRankId),
      name: this.sanitizeName(data.name),
      rg: this.sanitizeRg(data.rg),
    };
    return sanitized;
  };
}
