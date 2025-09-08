import { UserRepository } from "../../../domain/repositories";
import { ResourceInUseError } from "../../errors";
import { MilitaryInUseValidatorProtocol } from "../../protocols";

interface MilitaryInUseValidatorProps {
  userRepository: UserRepository;
}

export class MilitaryInUseValidator implements MilitaryInUseValidatorProtocol {
  constructor(private readonly props: MilitaryInUseValidatorProps) {}

  validate = async (militaryId: string): Promise<void> => {
    const { userRepository } = this.props;

    const allUser = await userRepository.listAll();
    const isInUse = allUser.some((user) => user.military.id === militaryId);

    if (isInUse) {
      throw new ResourceInUseError("Militar", "usuários");
    }
  };
}
