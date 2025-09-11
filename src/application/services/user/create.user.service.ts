import { UserInputDTO } from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import { CreateUserUseCase } from "../../../domain/use-cases";
import { UserDomainServices } from "./user-domain-services.interface";

export class CreateUserService implements CreateUserUseCase {
  constructor(private readonly dependencies: UserDomainServices) {}

  public readonly create = async (
    data: UserInputDTO,
    requestingUserRole?: UserRole,
  ): Promise<void> => {
    const {
      repository,
      passwordHasher,
      userInputDTOSanitizer,
      userInputDTOValidator,
    } = this.dependencies;

    const sanitizedData = userInputDTOSanitizer.sanitize(data);
    await userInputDTOValidator.validate(sanitizedData, requestingUserRole);

    const hashedPassword = await passwordHasher.hash(sanitizedData.password);
    const userDataWithHashedPassword = {
      ...sanitizedData,
      password: hashedPassword,
    };

    await repository.create(userDataWithHashedPassword);
  };
}
