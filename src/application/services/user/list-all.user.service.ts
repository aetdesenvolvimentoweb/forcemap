import { UserOutputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { ListAllUserUseCase } from "../../../domain/use-cases";
import { BaseListAllService, BaseListAllServiceDeps } from "../common";

interface ListAllUserServiceProps {
  userRepository: UserRepository;
}

export class ListAllUserService
  extends BaseListAllService<UserOutputDTO>
  implements ListAllUserUseCase
{
  constructor(props: ListAllUserServiceProps) {
    const baseServiceDeps: BaseListAllServiceDeps<UserOutputDTO> = {
      repository: props.userRepository,
    };
    super(baseServiceDeps);
  }
}
