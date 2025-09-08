import { UpdateUserInputDTO } from "../../../../domain/dtos";

export interface UpdateUserPasswordValidatorProtocol {
  validate(params: UpdateUserInputDTO): Promise<void>;
}
