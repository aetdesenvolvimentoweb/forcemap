import { VehicleInputDTO } from "../../domain/dtos";
import { VehicleSituation } from "../../domain/entities";
import { VehicleInputDTOSanitizerProtocol } from "../protocols";
import { sanitizeString } from "../utils";

export class VehicleInputDTOSanitizer
  implements VehicleInputDTOSanitizerProtocol
{
  public readonly sanitize = (data: VehicleInputDTO): VehicleInputDTO => {
    const complement: string = data.complement
      ? sanitizeString(data.complement)
      : "";

    const sanitized = {
      name: sanitizeString(data.name),
      situation: sanitizeString(data.situation) as VehicleSituation,
      complement,
    };
    return sanitized;
  };
}
