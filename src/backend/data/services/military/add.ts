import { MilitaryProps } from "@/backend/domain/entities";
import { AddMilitaryUsecase, Encrypter } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

type Dependencies = {
  validator: MilitaryValidator;
  repository: MilitaryRepository;
  encrypter: Encrypter;
};

export class AddMilitaryService implements AddMilitaryUsecase {
  private readonly validator: MilitaryValidator;
  private readonly repository: MilitaryRepository;
  private readonly encrypter: Encrypter;

  constructor(dependencies: Dependencies) {
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
    this.encrypter = dependencies.encrypter;
  }

  public readonly add = async (props: MilitaryProps): Promise<void> => {
    await this.validator.validateAddProps(props);

    const hashedPassword = await this.encrypter.encrypt(props.password);

    await this.repository.add(
      Object.assign({}, props, { password: hashedPassword })
    );
  };
}
