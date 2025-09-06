import { CreateUserController } from "../../../../presentation/controllers";
import { ControllerProtocol } from "../../../../presentation/protocols";
import { makeLogger } from "../../logger";
import { makeCreateUserService } from "../../services";

export const makeCreateUserController = (): ControllerProtocol => {
  const logger = makeLogger();
  const createUserService = makeCreateUserService();

  return new CreateUserController({
    createUserService,
    logger,
  });
};
