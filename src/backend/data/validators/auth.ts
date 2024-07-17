import { HashCompare, LoginProps, User } from "@/backend/domain/usecases";
import { credentialsError, missingParamError } from "../helpers";
import { MilitaryRepository } from "../repositories";

type Dependencies = {
  repository: MilitaryRepository;
  hashCompare: HashCompare;
};

export class AuthValidator {
  private repository: MilitaryRepository;
  private hashCompare: HashCompare;

  private rg: number;
  private password: string;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.hashCompare = dependencies.hashCompare;

    this.rg = 0;
    this.password = "";
  }

  private setRg = (rg: number): void => {
    this.rg = rg;
  };

  private setPassword = (password: string): void => {
    this.password = password;
  };

  private checkLogin = async (): Promise<User> => {
    if (!this.rg) {
      throw missingParamError("RG");
    }

    if (!this.password) {
      throw missingParamError("senha");
    }

    const userExist = await this.repository.getByRg(this.rg);

    if (!userExist) {
      throw credentialsError();
    }

    const hash = await this.repository.getHashedPassword(userExist.id);

    const match = await this.hashCompare.compare(this.password, hash);

    if (!match) {
      throw credentialsError();
    }

    return {
      id: userExist.id,
      name: userExist.name,
    };
  };

  public readonly signin = async (props: LoginProps): Promise<User> => {
    this.setRg(props.rg);
    this.setPassword(props.password);

    return await this.checkLogin();
  };
}
