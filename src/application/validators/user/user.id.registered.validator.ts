import { UserRepository } from "../../../domain/repositories";
import { EntityNotFoundError } from "../../errors";
import { UserIdRegisteredValidatorProtocol } from "../../protocols";

interface UserIdRegisteredValidatorProps {
  userRepository: UserRepository;
}

export class UserIdRegisteredValidator
  implements UserIdRegisteredValidatorProtocol
{
  constructor(private readonly props: UserIdRegisteredValidatorProps) {}

  validate = async (id: string): Promise<void> => {
    const { userRepository } = this.props;
    const user = await userRepository.findById(id);

    if (!user) {
      throw new EntityNotFoundError("Usuário");
    }
  };
}
