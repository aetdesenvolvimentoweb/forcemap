import { VehicleInputDTO } from "../../domain/dtos";
import { VehicleSituation } from "../../domain/entities";
import { VehicleInputDTOSanitizerProtocol } from "../protocols";

export class VehicleInputDTOSanitizer
  implements VehicleInputDTOSanitizerProtocol
{
  private readonly sanitizeString = (value: string): string => {
    if (!value || typeof value !== "string") return value;

    return value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");
  };

  public readonly sanitize = (data: VehicleInputDTO): VehicleInputDTO => {
    const complement: string = data.complement
      ? this.sanitizeString(data.complement)
      : "";

    const sanitized = {
      name: this.sanitizeString(data.name),
      situation: this.sanitizeString(data.situation) as VehicleSituation,
      complement,
    };
    return sanitized;
  };
}
