import { UserCredentialsInputDTOValidatorProtocol } from "../../../../application/protocols";
import { UserCredentialsInputDTOValidator } from "../../../../application/validators";

export const makeUserCredentialsInputDTOValidator =
  (): UserCredentialsInputDTOValidatorProtocol => {
    return new UserCredentialsInputDTOValidator();
  };
