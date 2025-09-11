import {
  UserCreationValidationStrategy,
  UserDeletionValidationStrategy,
  UserPasswordUpdateValidationStrategy,
  UserRoleUpdateValidationStrategy,
  UserValidationService,
} from "../../../../application/services/user";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import {
  makeIdValidator,
  makeUpdateUserPasswordValidator,
  makeUserIdRegisteredValidator,
  makeUserInputDTOValidator,
  makeUserRoleValidator,
} from "../../validators";

export const makeUserValidationService = (): UserValidationService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const userInputDTOValidator = makeUserInputDTOValidator(
    userRepository,
    idValidator,
    militaryRepository,
  );
  const updateUserPasswordValidator = makeUpdateUserPasswordValidator();
  const updateUserRoleValidator = makeUserRoleValidator();

  // Create strategy instances
  const userCreationValidationStrategy = new UserCreationValidationStrategy({
    userInputDTOValidator,
  });

  const userPasswordUpdateValidationStrategy =
    new UserPasswordUpdateValidationStrategy({
      idValidator,
      idRegisteredValidator,
      updateUserPasswordValidator,
    });

  const userRoleUpdateValidationStrategy = new UserRoleUpdateValidationStrategy(
    {
      idValidator,
      idRegisteredValidator,
      updateUserRoleValidator,
    },
  );

  const userDeletionValidationStrategy = new UserDeletionValidationStrategy({
    idValidator,
    idRegisteredValidator,
  });

  return new UserValidationService({
    idValidator,
    idRegisteredValidator,
    userCreationValidationStrategy,
    userPasswordUpdateValidationStrategy,
    userRoleUpdateValidationStrategy,
    userDeletionValidationStrategy,
  });
};
