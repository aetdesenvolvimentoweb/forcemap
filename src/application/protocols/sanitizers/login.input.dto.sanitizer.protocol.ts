import { LoginInputDTO } from "../../../domain/dtos";

export interface LoginInputDTOSanitizerProtocol {
  sanitize(data: LoginInputDTO): LoginInputDTO;
}
