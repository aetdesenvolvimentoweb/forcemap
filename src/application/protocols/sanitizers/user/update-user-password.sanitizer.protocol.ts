import { UpdateUserInputDTO } from "../../../../domain/dtos";

export interface UpdateUserPasswordSanitizerProtocol {
  sanitize(props: UpdateUserInputDTO): UpdateUserInputDTO;
}
