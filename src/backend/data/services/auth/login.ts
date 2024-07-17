import { LoginProps, LoginUsecase, User } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { AuthValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRepository;
  validator: AuthValidator;
};

export class LoginService implements LoginUsecase {
  private readonly repository: MilitaryRepository;
  private readonly validator: AuthValidator;

  constructor(dependencies: Dependencies) {
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
  }

  public readonly login = async (props: LoginProps): Promise<User> => {
    return await this.validator.signin(props);
  };
}
