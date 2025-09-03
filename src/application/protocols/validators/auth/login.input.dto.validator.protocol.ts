import { LoginInputDTO } from "../../../../domain/dtos";

export interface LoginInputDTOValidatorProtocol {
  validate(data: LoginInputDTO): void;
}
