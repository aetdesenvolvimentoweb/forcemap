import { UserOutputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { ListAllUserUseCase } from "../../../domain/use-cases";

interface ListAllUserServiceProps {
  userRepository: UserRepository;
}

export class ListAllUserService implements ListAllUserUseCase {
  private readonly props: ListAllUserServiceProps;

  constructor(props: ListAllUserServiceProps) {
    this.props = props;
  }

  public readonly listAll = async (): Promise<UserOutputDTO[]> => {
    const { userRepository } = this.props;
    return await userRepository.listAll();
  };
}
