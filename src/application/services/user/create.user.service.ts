import { UserInputDTO } from "../../../domain/dtos";
import { CreateUserUseCase } from "../../../domain/use-cases";
import { UserDomainServices } from "./user-domain-services.interface";

export class CreateUserService implements CreateUserUseCase {
  constructor(private readonly dependencies: UserDomainServices) {}

  public readonly create = async (data: UserInputDTO): Promise<void> => {
    const { repository, validation, sanitization, passwordHasher } =
      this.dependencies;

    const sanitizedData = sanitization.sanitizeUserCreation(data);
    await validation.validateUserCreation(sanitizedData);

    const hashedPassword = await passwordHasher.hash(sanitizedData.password);
    const userDataWithHashedPassword = {
      ...sanitizedData,
      password: hashedPassword,
    };

    await repository.create(userDataWithHashedPassword);
  };
}
